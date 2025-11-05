"use server"

import { db } from "@/db"
import { subtasks } from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

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

export type SubtaskData = {
	id: string
	taskId: string
	title: string
	completed: boolean
	displayOrder: number
	createdAt: Date
	updatedAt: Date
}

// GET all subtasks for a task
export async function getSubtasks(taskId: string): Promise<SubtaskData[]> {
	await getCurrentUser() // Ensure authenticated

	try {
		const taskSubtasks = await db
			.select()
			.from(subtasks)
			.where(eq(subtasks.taskId, taskId))
			.orderBy(asc(subtasks.displayOrder), asc(subtasks.createdAt))

		return taskSubtasks
	} catch (error) {
		console.error("Error fetching subtasks:", error)
		throw new Error("Failed to fetch subtasks")
	}
}

// CREATE a new subtask
export async function createSubtask(data: {
	taskId: string
	title: string
	displayOrder?: number
}): Promise<SubtaskData> {
	await getCurrentUser() // Ensure authenticated

	try {
		// Get the highest display order for this task
		const existingSubtasks = await db
			.select()
			.from(subtasks)
			.where(eq(subtasks.taskId, data.taskId))

		const maxOrder =
			existingSubtasks.length > 0
				? Math.max(...existingSubtasks.map((s) => s.displayOrder))
				: -1

		const [newSubtask] = await db
			.insert(subtasks)
			.values({
				taskId: data.taskId,
				title: data.title,
				completed: false,
				displayOrder: data.displayOrder ?? maxOrder + 1,
			})
			.returning()

		revalidatePath("/")
		return newSubtask
	} catch (error) {
		console.error("Error creating subtask:", error)
		throw new Error("Failed to create subtask")
	}
}

// UPDATE a subtask
export async function updateSubtask(
	subtaskId: string,
	updates: {
		title?: string
		completed?: boolean
		displayOrder?: number
	}
): Promise<SubtaskData> {
	await getCurrentUser() // Ensure authenticated

	try {
		const [updatedSubtask] = await db
			.update(subtasks)
			.set({
				...updates,
				updatedAt: new Date(),
			})
			.where(eq(subtasks.id, subtaskId))
			.returning()

		if (!updatedSubtask) {
			throw new Error("Subtask not found")
		}

		revalidatePath("/")
		return updatedSubtask
	} catch (error) {
		console.error("Error updating subtask:", error)
		throw new Error("Failed to update subtask")
	}
}

// DELETE a subtask
export async function deleteSubtask(subtaskId: string): Promise<void> {
	await getCurrentUser() // Ensure authenticated

	try {
		await db.delete(subtasks).where(eq(subtasks.id, subtaskId))

		revalidatePath("/")
	} catch (error) {
		console.error("Error deleting subtask:", error)
		throw new Error("Failed to delete subtask")
	}
}

// TOGGLE subtask completion
export async function toggleSubtask(subtaskId: string): Promise<SubtaskData> {
	await getCurrentUser() // Ensure authenticated

	try {
		// First get the current state
		const [currentSubtask] = await db
			.select()
			.from(subtasks)
			.where(eq(subtasks.id, subtaskId))

		if (!currentSubtask) {
			throw new Error("Subtask not found")
		}

		// Toggle the completed state
		const [updatedSubtask] = await db
			.update(subtasks)
			.set({
				completed: !currentSubtask.completed,
				updatedAt: new Date(),
			})
			.where(eq(subtasks.id, subtaskId))
			.returning()

		revalidatePath("/")
		return updatedSubtask
	} catch (error) {
		console.error("Error toggling subtask:", error)
		throw new Error("Failed to toggle subtask")
	}
}
