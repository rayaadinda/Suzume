"use server"

import { db } from "@/db"
import { noteFolders, type NoteFolder } from "@/db/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, and } from "drizzle-orm"
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

export async function getFolders(): Promise<NoteFolder[]> {
	const user = await getCurrentUser()

	try {
		const folders = await db.query.noteFolders.findMany({
			where: eq(noteFolders.userId, user.id),
			orderBy: [noteFolders.displayOrder],
		})

		return folders
	} catch (error) {
		console.error("Error fetching folders:", error)
		throw new Error("Failed to fetch folders")
	}
}

export async function createFolder(data: {
	name: string
	parentId?: string
	color?: string
	iconEmoji?: string
}): Promise<NoteFolder> {
	const user = await getCurrentUser()

	try {
		const [folder] = await db
			.insert(noteFolders)
			.values({
				...data,
				userId: user.id,
			})
			.returning()

		revalidatePath("/notes")
		return folder
	} catch (error) {
		console.error("Error creating folder:", error)
		throw new Error("Failed to create folder")
	}
}

export async function updateFolder(
	id: string,
	updates: {
		name?: string
		color?: string
		iconEmoji?: string
	}
): Promise<NoteFolder> {
	const user = await getCurrentUser()

	try {
		const [updated] = await db
			.update(noteFolders)
			.set(updates)
			.where(and(eq(noteFolders.id, id), eq(noteFolders.userId, user.id)))
			.returning()

		revalidatePath("/notes")
		return updated
	} catch (error) {
		console.error("Error updating folder:", error)
		throw new Error("Failed to update folder")
	}
}

export async function deleteFolder(id: string): Promise<void> {
	const user = await getCurrentUser()

	try {
		await db
			.delete(noteFolders)
			.where(and(eq(noteFolders.id, id), eq(noteFolders.userId, user.id)))

		revalidatePath("/notes")
	} catch (error) {
		console.error("Error deleting folder:", error)
		throw new Error("Failed to delete folder")
	}
}
