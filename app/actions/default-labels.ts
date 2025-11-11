"use server"

import { db } from "@/db"
import { labels } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * Creates default labels for a new user
 * Should be called after user signup
 */
export async function createDefaultLabelsForUser(
	userId: string
): Promise<void> {
	const DEFAULT_LABELS = [
		{
			name: "Design",
			color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400",
		},
		{
			name: "Marketing",
			color:
				"bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
		},
		{
			name: "Product",
			color: "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400",
		},
		{
			name: "New releases",
			color:
				"bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
		},
		{
			name: "New features",
			color:
				"bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
		},
	]

	try {
		// Check if user already has labels
		const existingLabels = await db
			.select()
			.from(labels)
			.where(eq(labels.userId, userId))

		// Only create default labels if user has none
		if (existingLabels.length === 0) {
			await db.insert(labels).values(
				DEFAULT_LABELS.map((label) => ({
					name: label.name,
					color: label.color,
					userId: userId,
				}))
			)
			console.log(
				`✅ Created ${DEFAULT_LABELS.length} default labels for user ${userId}`
			)
		}
	} catch (error) {
		console.error("Error creating default labels:", error)
		// Don't throw - failing to create labels shouldn't block signup
	}
}
