"use server"

import { db } from "@/db"
import { noteTemplates, type NoteTemplate } from "@/db/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, or } from "drizzle-orm"
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

export async function getTemplates(): Promise<NoteTemplate[]> {
	const user = await getCurrentUser()

	try {
		const templates = await db.query.noteTemplates.findMany({
			where: or(
				eq(noteTemplates.isSystem, true),
				eq(noteTemplates.userId, user.id)
			),
			orderBy: [noteTemplates.category, noteTemplates.name],
		})

		return templates
	} catch (error) {
		console.error("Error fetching templates:", error)
		throw new Error("Failed to fetch templates")
	}
}

export async function createTemplate(data: {
	name: string
	description?: string
	content: string
	category?: string
	iconEmoji?: string
}): Promise<NoteTemplate> {
	const user = await getCurrentUser()

	try {
		const [template] = await db
			.insert(noteTemplates)
			.values({
				...data,
				userId: user.id,
			})
			.returning()

		revalidatePath("/notes")
		return template
	} catch (error) {
		console.error("Error creating template:", error)
		throw new Error("Failed to create template")
	}
}
