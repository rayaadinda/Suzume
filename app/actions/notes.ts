"use server"

import { db } from "@/db"
import {
	notes,
	noteTaskLinks,
	type Note,
	type NoteWithRelations,
} from "@/db/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, and, desc, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

async function getCurrentUser() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		throw new Error("Unauthorized")
	}

	return session.user
}

export async function getNotes(
	folderId?: string
): Promise<NoteWithRelations[]> {
	const user = await getCurrentUser()

	try {
		const whereConditions = [
			eq(notes.userId, user.id),
			eq(notes.isArchived, false),
		]

		if (folderId) {
			whereConditions.push(eq(notes.folderId, folderId))
		}

		const query = await db.query.notes.findMany({
			where: and(...whereConditions),
			with: {
				user: true,
				folder: true,
				lastEditor: true,
				taskLinks: {
					with: {
						task: true,
					},
				},
			},
			orderBy: [desc(notes.isPinned), desc(notes.updatedAt)],
		})

		return query
	} catch (error) {
		console.error("Error fetching notes:", error)
		throw new Error("Failed to fetch notes")
	}
}

export async function getNote(id: string): Promise<NoteWithRelations | null> {
	const user = await getCurrentUser()

	try {
		const note = await db.query.notes.findFirst({
			where: and(eq(notes.id, id), eq(notes.userId, user.id)),
			with: {
				user: true,
				folder: true,
				lastEditor: true,
				taskLinks: {
					with: {
						task: true,
					},
				},
			},
		})

		return note || null
	} catch (error) {
		console.error("Error fetching note:", error)
		throw new Error("Failed to fetch note")
	}
}

export async function createNote(data: {
	title: string
	content?: string
	folderId?: string
	templateId?: string
}): Promise<Note> {
	const user = await getCurrentUser()

	try {
		const [note] = await db
			.insert(notes)
			.values({
				title: data.title,
				content: data.content || "{}",
				folderId: data.folderId,
				userId: user.id,
				lastEditedBy: user.id,
			})
			.returning()

		revalidatePath("/notes")
		return note
	} catch (error) {
		console.error("Error creating note:", error)
		throw new Error("Failed to create note")
	}
}

export async function updateNote(
	id: string,
	updates: {
		title?: string
		content?: string
		plainText?: string
		folderId?: string
		iconEmoji?: string
		coverImage?: string
		isPinned?: boolean
	}
): Promise<Note> {
	const user = await getCurrentUser()

	try {
		const [updated] = await db
			.update(notes)
			.set({
				...updates,
				updatedAt: new Date(),
				lastEditedBy: user.id,
			})
			.where(and(eq(notes.id, id), eq(notes.userId, user.id)))
			.returning()

		revalidatePath("/notes")
		return updated
	} catch (error) {
		console.error("Error updating note:", error)
		throw new Error("Failed to update note")
	}
}

export async function deleteNote(id: string): Promise<void> {
	const user = await getCurrentUser()

	try {
		await db
			.delete(notes)
			.where(and(eq(notes.id, id), eq(notes.userId, user.id)))

		revalidatePath("/notes")
	} catch (error) {
		console.error("Error deleting note:", error)
		throw new Error("Failed to delete note")
	}
}

export async function searchNotes(query: string): Promise<NoteWithRelations[]> {
	const user = await getCurrentUser()

	try {
		const results = await db.query.notes.findMany({
			where: and(
				eq(notes.userId, user.id),
				eq(notes.isArchived, false),
				sql`(${notes.title} ILIKE ${`%${query}%`} OR ${notes.plainText} ILIKE ${`%${query}%`})`
			),
			with: {
				user: true,
				folder: true,
				taskLinks: {
					with: {
						task: true,
					},
				},
			},
			orderBy: [desc(notes.updatedAt)],
		})

		return results
	} catch (error) {
		console.error("Error searching notes:", error)
		throw new Error("Failed to search notes")
	}
}

export async function linkNoteToTask(
	noteId: string,
	taskId: string
): Promise<void> {
	const user = await getCurrentUser()

	try {
		await db.insert(noteTaskLinks).values({
			noteId,
			taskId,
		})

		revalidatePath("/notes")
		revalidatePath("/tasks")
	} catch (error) {
		console.error("Error linking note to task:", error)
		throw new Error("Failed to link note to task")
	}
}

export async function unlinkNoteFromTask(
	noteId: string,
	taskId: string
): Promise<void> {
	const user = await getCurrentUser()

	try {
		await db
			.delete(noteTaskLinks)
			.where(
				and(
					eq(noteTaskLinks.noteId, noteId),
					eq(noteTaskLinks.taskId, taskId)
				)
			)

		revalidatePath("/notes")
		revalidatePath("/tasks")
	} catch (error) {
		console.error("Error unlinking note from task:", error)
		throw new Error("Failed to unlink note from task")
	}
}
