import { db } from "./index"
import { statuses, labels, tasks, taskAssignees, taskLabels } from "./schema"

async function seed() {
	console.log("🌱 Seeding database...")

	try {
		// Clear existing data (in reverse order of dependencies)
		console.log("Clearing existing data...")
		await db.delete(taskLabels)
		await db.delete(taskAssignees)
		await db.delete(tasks)
		await db.delete(labels)
		await db.delete(statuses)
		// Don't delete users - they're created via BetterAuth signup

		// Seed Statuses (immutable workflow)
		console.log("Seeding statuses...")
		await db.insert(statuses).values([
			{ id: "backlog", name: "Backlog", color: "#53565A", displayOrder: 0 },
			{ id: "to-do", name: "Todo", color: "#53565A", displayOrder: 1 },
			{
				id: "in-progress",
				name: "In Progress",
				color: "#facc15",
				displayOrder: 2,
			},
			{ id: "completed", name: "Completed", color: "#8b5cf6", displayOrder: 3 },
		])

		// Note: Labels are user-specific and cannot be seeded without a userId.
		// Default labels are automatically created when a user signs up.
		// See: app/actions/default-labels.ts and app/signup/page.tsx

		console.log("✅ Database seeded successfully!")
		console.log(
			"ℹ️  Labels are now user-specific - create them via the UI after signup"
		)
		console.log(
			"ℹ️  New users automatically get 5 default labels: Design, Marketing, Product, New releases, New features"
		)
	} catch (error) {
		console.error("❌ Error seeding database:", error)
		throw error
	}
}

seed()
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
	.finally(() => {
		console.log("🏁 Seed script completed")
		process.exit(0)
	})
