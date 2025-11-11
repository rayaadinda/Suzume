"use server"

import { db } from "@/db"
import {
	tasks,
	taskAssignees,
	taskLabels,
	statuses,
	users,
	labels,
	noteTaskLinks,
	notes,
} from "@/db/schema"
import { eq, and, inArray, desc, asc, or, ilike } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import * as jose from "jose"

// Type for task with all relations populated
export type TaskWithRelations = {
	id: string
	title: string
	description: string
	statusId: string
	date: string | null
	commentsCount: number
	attachmentsCount: number
	linksCount: number
	progressCompleted: number
	progressTotal: number
	priority: string
	isRecurring: boolean
	recurrencePattern: string | null
	recurrenceInterval: number | null
	recurrenceDays: string | null
	recurrenceEndDate: Date | null
	parentRecurringTaskId: string | null
	timeBlockStart: string | null
	timeBlockEnd: string | null
	createdAt: Date
	updatedAt: Date
	status: {
		id: string
		name: string
		color: string
		displayOrder: number
	}
	assignees: Array<{
		id: string
		name: string
		email: string
		image: string | null
	}>
	labels: Array<{
		id: string
		name: string
		color: string
	}>
	noteLinks: Array<{
		noteId: string
		taskId: string
		note: {
			id: string
			title: string
			content: string
			plainText: string | null
			iconEmoji: string | null
			updatedAt: Date
		}
	}>
}

// Helper function to get current user session
async function getCurrentUser() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		throw new Error("Unauthorized")
	}

	return session.user
}

// Helper function to generate JWT token for WebSocket authentication
async function generateJWT(userId: string, email: string): Promise<string> {
	const secret = new TextEncoder().encode(
		process.env.BETTER_AUTH_SECRET || "your-secret-key"
	)

	const token = await new jose.SignJWT({
		sub: userId,
		email: email,
	})
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("24h")
		.sign(secret)

	return token
}

// Helper function to broadcast updates to WebSocket clients
async function broadcastTaskUpdate(
	type: string,
	taskData: Record<string, unknown>
) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user?.id) {
			return // No session, skip broadcast
		}

		// Generate JWT token for the backend
		const jwtToken = await generateJWT(session.user.id, session.user.email)

		// Convert WebSocket URL to HTTP URL for REST API
		const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws"
		const httpUrl = wsUrl
			.replace("ws://", "http://")
			.replace("wss://", "https://")
			.replace("/ws", "/api/broadcast")

		const response = await fetch(httpUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${jwtToken}`,
			},
			body: JSON.stringify({
				type,
				data: taskData,
			}),
		})

		if (!response.ok) {
			console.error("Failed to broadcast update:", await response.text())
		}
	} catch (error) {
		console.error("Error broadcasting update:", error)
		// Don't throw - broadcast failures shouldn't break the main operation
	}
}

// GET all tasks with relations
export async function getTasks(filters?: {
	statusId?: string
	priority?: string
	assigneeId?: string
	labelIds?: string[]
	search?: string
	dateFrom?: string
	dateTo?: string
	sortBy?: "status" | "priority" | "date" | "alphabetical"
}): Promise<TaskWithRelations[]> {
	const user = await getCurrentUser() // Ensure authenticated

	try {
		// Build where conditions - ALWAYS filter by userId for security
		const conditions = [eq(tasks.userId, user.id)]

		if (filters?.statusId) {
			conditions.push(eq(tasks.statusId, filters.statusId))
		}
		if (filters?.priority && filters.priority !== "all") {
			conditions.push(eq(tasks.priority, filters.priority))
		}
		if (filters?.search) {
			conditions.push(
				or(
					ilike(tasks.title, `%${filters.search}%`),
					ilike(tasks.description, `%${filters.search}%`)
				)
			)
		}
		if (filters?.dateFrom) {
			conditions.push(eq(tasks.date, filters.dateFrom))
		}
		if (filters?.dateTo) {
			conditions.push(eq(tasks.date, filters.dateTo))
		}

		// Build and execute query with proper type handling
		const queryBuilder = db
			.select({
				task: tasks,
				status: statuses,
			})
			.from(tasks)
			.leftJoin(statuses, eq(tasks.statusId, statuses.id))
			.$dynamic()

		// Apply filters
		const filteredQuery =
			conditions.length > 0
				? queryBuilder.where(and(...conditions))
				: queryBuilder

		// Apply sorting and execute query
		let results
		if (filters?.sortBy === "alphabetical") {
			results = await filteredQuery.orderBy(asc(tasks.title))
		} else if (filters?.sortBy === "priority") {
			results = await filteredQuery.orderBy(desc(tasks.priority))
		} else if (filters?.sortBy === "date") {
			results = await filteredQuery.orderBy(desc(tasks.createdAt))
		} else {
			results = await filteredQuery.orderBy(
				asc(statuses.displayOrder),
				desc(tasks.createdAt)
			)
		}

		// Get all task IDs
		const taskIds = results.map((r) => r.task.id)

		if (taskIds.length === 0) {
			return []
		}

		// Get assignees for all tasks
		const taskAssigneesData = await db
			.select({
				taskId: taskAssignees.taskId,
				user: users,
			})
			.from(taskAssignees)
			.leftJoin(users, eq(taskAssignees.userId, users.id))
			.where(inArray(taskAssignees.taskId, taskIds))

		// Get labels for all tasks
		const taskLabelsData = await db
			.select({
				taskId: taskLabels.taskId,
				label: labels,
			})
			.from(taskLabels)
			.leftJoin(labels, eq(taskLabels.labelId, labels.id))
			.where(inArray(taskLabels.taskId, taskIds))

		// Get note links for all tasks
		const taskNoteLinksData = await db
			.select({
				noteLink: noteTaskLinks,
				note: notes,
			})
			.from(noteTaskLinks)
			.leftJoin(notes, eq(noteTaskLinks.noteId, notes.id))
			.where(inArray(noteTaskLinks.taskId, taskIds))

		// Filter by assignee if needed
		let filteredTaskIds = taskIds
		if (filters?.assigneeId && filters.assigneeId !== "all") {
			if (filters.assigneeId === "unassigned") {
				const assignedTaskIds = new Set(
					taskAssigneesData.map((ta) => ta.taskId)
				)
				filteredTaskIds = taskIds.filter((id) => !assignedTaskIds.has(id))
			} else {
				filteredTaskIds = taskAssigneesData
					.filter((ta) => ta.user?.id === filters.assigneeId)
					.map((ta) => ta.taskId)
			}
		}

		// Filter by labels if needed
		if (filters?.labelIds && filters.labelIds.length > 0) {
			const tasksWithLabels = taskLabelsData
				.filter((tl) => tl.label && filters.labelIds!.includes(tl.label.id))
				.map((tl) => tl.taskId)

			// Only keep tasks that have at least one of the specified labels
			const uniqueTaskIds = Array.from(new Set(tasksWithLabels))
			filteredTaskIds = filteredTaskIds.filter((id) => uniqueTaskIds.includes(id))
		}

		// Build the response
		const tasksWithRelations: TaskWithRelations[] = results
			.filter((r) => filteredTaskIds.includes(r.task.id))
			.map((result) => {
				const taskAssigneesList = taskAssigneesData
					.filter((ta) => ta.taskId === result.task.id && ta.user)
					.map((ta) => ({
						id: ta.user!.id,
						name: ta.user!.name,
						email: ta.user!.email,
						image: ta.user!.image,
					}))

				const taskLabelsList = taskLabelsData
					.filter((tl) => tl.taskId === result.task.id && tl.label)
					.map((tl) => ({
						id: tl.label!.id,
						name: tl.label!.name,
						color: tl.label!.color,
					}))

				const taskNoteLinksList = taskNoteLinksData
					.filter((tnl) => tnl.noteLink.taskId === result.task.id && tnl.note)
					.map((tnl) => ({
						noteId: tnl.noteLink.noteId,
						taskId: tnl.noteLink.taskId,
						note: {
							id: tnl.note!.id,
							title: tnl.note!.title,
							content: tnl.note!.content,
							plainText: tnl.note!.plainText,
							iconEmoji: tnl.note!.iconEmoji,
							updatedAt: tnl.note!.updatedAt,
						},
					}))

				return {
					id: result.task.id,
					title: result.task.title,
					description: result.task.description,
					statusId: result.task.statusId,
					date: result.task.date,
					commentsCount: result.task.commentsCount,
					attachmentsCount: result.task.attachmentsCount,
					linksCount: result.task.linksCount,
					progressCompleted: result.task.progressCompleted,
					progressTotal: result.task.progressTotal,
					priority: result.task.priority,
					isRecurring: result.task.isRecurring,
					recurrencePattern: result.task.recurrencePattern,
					recurrenceInterval: result.task.recurrenceInterval,
					recurrenceDays: result.task.recurrenceDays,
					recurrenceEndDate: result.task.recurrenceEndDate,
					parentRecurringTaskId: result.task.parentRecurringTaskId,
					timeBlockStart: result.task.timeBlockStart,
					timeBlockEnd: result.task.timeBlockEnd,
					createdAt: result.task.createdAt,
					updatedAt: result.task.updatedAt,
					status: {
						id: result.status!.id,
						name: result.status!.name,
						color: result.status!.color,
						displayOrder: result.status!.displayOrder,
					},
					assignees: taskAssigneesList,
					labels: taskLabelsList,
					noteLinks: taskNoteLinksList,
				}
			})

		return tasksWithRelations
	} catch (error) {
		console.error("Error fetching tasks:", error)
		throw new Error("Failed to fetch tasks")
	}
}

// CREATE a new task
export async function createTask(data: {
	title: string
	description: string
	statusId: string
	priority: string
	assigneeIds?: string[]
	labelIds?: string[]
	date?: string
	isRecurring?: boolean
	recurrencePattern?: string
	recurrenceInterval?: number
	recurrenceDays?: string[]
	recurrenceEndDate?: string
}): Promise<TaskWithRelations> {
	const user = await getCurrentUser() // Ensure authenticated

	try {
		// Insert the task with userId for ownership
		const [newTask] = await db
			.insert(tasks)
			.values({
				title: data.title,
				description: data.description,
				statusId: data.statusId,
				userId: user.id,
				priority: data.priority,
				date: data.date,
				isRecurring: data.isRecurring || false,
				recurrencePattern: data.recurrencePattern,
				recurrenceInterval: data.recurrenceInterval,
				recurrenceDays: data.recurrenceDays
					? JSON.stringify(data.recurrenceDays)
					: null,
				recurrenceEndDate: data.recurrenceEndDate
					? new Date(data.recurrenceEndDate)
					: null,
			})
			.returning()

		// Add assignees
		if (data.assigneeIds && data.assigneeIds.length > 0) {
			await db.insert(taskAssignees).values(
				data.assigneeIds.map((userId) => ({
					taskId: newTask.id,
					userId,
				}))
			)
		}

		// Add labels
		if (data.labelIds && data.labelIds.length > 0) {
			await db.insert(taskLabels).values(
				data.labelIds.map((labelId) => ({
					taskId: newTask.id,
					labelId,
				}))
			)
		}

		// Fetch the complete task with relations
		const [completeTask] = await getTasks()
		const createdTask = completeTask // Get the first task (just created)

		// Broadcast the update
		await broadcastTaskUpdate("task_created", {
			id: newTask.id,
			title: newTask.title,
			statusId: newTask.statusId,
		})

		revalidatePath("/")
		return createdTask
	} catch (error) {
		console.error("Error creating task:", error)
		throw new Error("Failed to create task")
	}
}

// UPDATE a task
export async function updateTask(
	taskId: string,
	updates: Partial<{
		title: string
		description: string
		statusId: string
		priority: string
		date: string
		progressCompleted: number
		progressTotal: number
		assigneeIds: string[]
		labelIds: string[]
		isRecurring: boolean
		recurrencePattern: string
		recurrenceInterval: number
		recurrenceDays: string[]
		recurrenceEndDate: string
		timeBlockStart: string | null
		timeBlockEnd: string | null
	}>
): Promise<TaskWithRelations> {
	const user = await getCurrentUser() // Ensure authenticated

	try {
		// Update the task
		const taskUpdates: {
			title?: string
			description?: string
			statusId?: string
			priority?: string
			date?: string
			progressCompleted?: number
			progressTotal?: number
			isRecurring?: boolean
			recurrencePattern?: string | null
			recurrenceInterval?: number | null
			recurrenceDays?: string | null
			recurrenceEndDate?: Date | null
			timeBlockStart?: string | null
			timeBlockEnd?: string | null
			updatedAt?: Date
		} = {}
		if (updates.title !== undefined) taskUpdates.title = updates.title
		if (updates.description !== undefined)
			taskUpdates.description = updates.description
		if (updates.statusId !== undefined) taskUpdates.statusId = updates.statusId
		if (updates.priority !== undefined) taskUpdates.priority = updates.priority
		if (updates.date !== undefined) taskUpdates.date = updates.date
		if (updates.isRecurring !== undefined)
			taskUpdates.isRecurring = updates.isRecurring
		if (updates.recurrencePattern !== undefined)
			taskUpdates.recurrencePattern = updates.recurrencePattern
		if (updates.recurrenceInterval !== undefined)
			taskUpdates.recurrenceInterval = updates.recurrenceInterval
		if (updates.recurrenceDays !== undefined)
			taskUpdates.recurrenceDays = JSON.stringify(updates.recurrenceDays)
		if (updates.recurrenceEndDate !== undefined)
			taskUpdates.recurrenceEndDate = updates.recurrenceEndDate
				? new Date(updates.recurrenceEndDate)
				: null
		if (updates.timeBlockStart !== undefined)
			taskUpdates.timeBlockStart = updates.timeBlockStart
		if (updates.timeBlockEnd !== undefined)
			taskUpdates.timeBlockEnd = updates.timeBlockEnd
		if (updates.progressCompleted !== undefined)
			taskUpdates.progressCompleted = updates.progressCompleted
		if (updates.progressTotal !== undefined)
			taskUpdates.progressTotal = updates.progressTotal

		if (Object.keys(taskUpdates).length > 0) {
			taskUpdates.updatedAt = new Date()
			// Only update tasks owned by this user
			await db.update(tasks).set(taskUpdates).where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
		}

		// Update assignees if provided
		if (updates.assigneeIds !== undefined) {
			await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId))
			if (updates.assigneeIds.length > 0) {
				await db.insert(taskAssignees).values(
					updates.assigneeIds.map((userId) => ({
						taskId,
						userId,
					}))
				)
			}
		}

		// Update labels if provided
		if (updates.labelIds !== undefined) {
			await db.delete(taskLabels).where(eq(taskLabels.taskId, taskId))
			if (updates.labelIds.length > 0) {
				await db.insert(taskLabels).values(
					updates.labelIds.map((labelId) => ({
						taskId,
						labelId,
					}))
				)
			}
		}

		const allTasks = await getTasks()
		const updatedTask = allTasks.find((t) => t.id === taskId)

		if (!updatedTask) {
			throw new Error("Task not found after update")
		}

		await broadcastTaskUpdate("task_updated", {
			id: taskId,
			...updates,
		})

		revalidatePath("/")
		return updatedTask
	} catch (error) {
		console.error("Error updating task:", error)
		throw new Error("Failed to update task")
	}
}

export async function updateTaskStatus(
	taskId: string,
	newStatusId: string
): Promise<TaskWithRelations> {
	const user = await getCurrentUser()

	try {
		// Only update tasks owned by this user
		await db
			.update(tasks)
			.set({
				statusId: newStatusId,
				updatedAt: new Date(),
			})
			.where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))

		const allTasks = await getTasks()
		const updatedTask = allTasks.find((t) => t.id === taskId)

		if (!updatedTask) {
			throw new Error("Task not found after status update")
		}

		await broadcastTaskUpdate("task_status_changed", {
			id: taskId,
			statusId: newStatusId,
		})

		revalidatePath("/")
		return updatedTask
	} catch (error) {
		console.error("Error updating task status:", error)
		throw new Error("Failed to update task status")
	}
}

export async function deleteTask(taskId: string): Promise<void> {
	const user = await getCurrentUser()

	try {
		// Only delete tasks owned by this user
		await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))

		await broadcastTaskUpdate("task_deleted", {
			id: taskId,
		})

		revalidatePath("/")
	} catch (error) {
		console.error("Error deleting task:", error)
		throw new Error("Failed to delete task")
	}
}
