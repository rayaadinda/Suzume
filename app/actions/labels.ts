"use server"

import { db } from "@/db"
import { labels } from "@/db/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"

export type LabelData = {
	id: string
	name: string
	color: string
	userId: string
	createdAt: Date
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

// GET all labels (for label selection) - only user's own labels
export async function getLabels(): Promise<LabelData[]> {
	const user = await getCurrentUser() // Ensure authenticated

	try {
		const allLabels = await db
			.select({
				id: labels.id,
				name: labels.name,
				color: labels.color,
				userId: labels.userId,
				createdAt: labels.createdAt,
			})
			.from(labels)
			.where(eq(labels.userId, user.id))

		return allLabels
	} catch (error) {
		console.error("Error fetching labels:", error)
		throw new Error("Failed to fetch labels")
	}
}

// CREATE a new label
export async function createLabel(data: {
	name: string
	color: string
}): Promise<LabelData> {
	const user = await getCurrentUser()

	try {
		const [newLabel] = await db
			.insert(labels)
			.values({
				name: data.name,
				color: data.color,
				userId: user.id,
			})
			.returning()

		return {
			id: newLabel.id,
			name: newLabel.name,
			color: newLabel.color,
			userId: newLabel.userId,
			createdAt: newLabel.createdAt,
		}
	} catch (error) {
		console.error("Error creating label:", error)
		throw new Error("Failed to create label")
	}
}

// UPDATE a label
export async function updateLabel(
	id: string,
	data: { name?: string; color?: string }
): Promise<LabelData> {
	const user = await getCurrentUser()

	try {
		// Ensure the label belongs to the user
		const [label] = await db.select().from(labels).where(eq(labels.id, id))

		if (!label || label.userId !== user.id) {
			throw new Error("Label not found or unauthorized")
		}

		const [updatedLabel] = await db
			.update(labels)
			.set({
				...(data.name && { name: data.name }),
				...(data.color && { color: data.color }),
			})
			.where(eq(labels.id, id))
			.returning()

		return {
			id: updatedLabel.id,
			name: updatedLabel.name,
			color: updatedLabel.color,
			userId: updatedLabel.userId,
			createdAt: updatedLabel.createdAt,
		}
	} catch (error) {
		console.error("Error updating label:", error)
		throw new Error("Failed to update label")
	}
}

// DELETE a label
export async function deleteLabel(id: string): Promise<void> {
	const user = await getCurrentUser()

	try {
		// Ensure the label belongs to the user
		const [label] = await db.select().from(labels).where(eq(labels.id, id))

		if (!label || label.userId !== user.id) {
			throw new Error("Label not found or unauthorized")
		}

		await db.delete(labels).where(eq(labels.id, id))
	} catch (error) {
		console.error("Error deleting label:", error)
		throw new Error("Failed to delete label")
	}
}
