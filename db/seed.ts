import { db } from "./index"
import {
	statuses,
	labels,
	users,
	tasks,
	taskAssignees,
	taskLabels,
} from "./schema"

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
		await db.delete(users)

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

		// Seed Labels
		console.log("Seeding labels...")
		await db.insert(labels).values([
			{
				id: "design",
				name: "Design",
				color:
					"bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400",
			},
			{
				id: "marketing",
				name: "Marketing",
				color:
					"bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
			},
			{
				id: "product",
				name: "Product",
				color:
					"bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400",
			},
			{
				id: "new-releases",
				name: "New releases",
				color:
					"bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
			},
			{
				id: "new-features",
				name: "New features",
				color:
					"bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
			},
		])

		// Seed Sample Users
		console.log("Seeding users...")
		const insertedUsers = await db
			.insert(users)
			.values([
				{
					name: "Leonel Ngoya",
					email: "leonelngoya@gmail.com",
					image: "https://api.dicebear.com/9.x/glass/svg?seed=LeonelNgoya",
				},
				{
					name: "LN",
					email: "me@leonelngoya.com",
					image: "https://api.dicebear.com/9.x/glass/svg?seed=LN",
				},
				{
					name: "Charlie Brown",
					email: "charlie@acme.inc",
					image: "https://api.dicebear.com/9.x/glass/svg?seed=CharlieBrown",
				},
				{
					name: "Diana Prince",
					email: "diana@acme.inc",
					image: "https://api.dicebear.com/9.x/glass/svg?seed=DianaPrince",
				},
			])
			.returning()

		console.log(`✅ Seeded ${insertedUsers.length} users`)

		// Seed Sample Tasks
		console.log("Seeding sample tasks...")
		const sampleTasks = await db
			.insert(tasks)
			.values([
				{
					title: "Mobile app redesign",
					description: "Complete redesign of mobile application for better UX",
					statusId: "backlog",
					date: "Feb 10",
					commentsCount: 2,
					attachmentsCount: 5,
					linksCount: 3,
					progressCompleted: 0,
					progressTotal: 0,
					priority: "low",
				},
				{
					title: "Design system update",
					description: "Enhance design system for consistency and usability",
					statusId: "to-do",
					date: "Jan 25",
					commentsCount: 4,
					attachmentsCount: 0,
					linksCount: 0,
					progressCompleted: 1,
					progressTotal: 4,
					priority: "high",
				},
				{
					title: "Search features",
					description: "Upgrade search for faster, accurate user results",
					statusId: "in-progress",
					date: "Jan 25",
					commentsCount: 0,
					attachmentsCount: 0,
					linksCount: 12,
					progressCompleted: 0,
					progressTotal: 0,
					priority: "urgent",
				},
				{
					title: "Payment gateway integration",
					description: "Integrate Stripe payment system for subscriptions",
					statusId: "in-progress",
					date: "Jan 20",
					commentsCount: 8,
					attachmentsCount: 0,
					linksCount: 5,
					progressCompleted: 3,
					progressTotal: 4,
					priority: "high",
				},
				{
					title: "Database migration",
					description: "Migrate to new database infrastructure",
					statusId: "to-do",
					date: "Jan 15",
					commentsCount: 12,
					attachmentsCount: 15,
					linksCount: 6,
					progressCompleted: 0,
					progressTotal: 5,
					priority: "high",
				},
				{
					title: "Increase conversion rate by 25%",
					description:
						"Boost conversions through better onboarding and experience",
					statusId: "completed",
					date: "Jan 25",
					commentsCount: 4,
					attachmentsCount: 0,
					linksCount: 0,
					progressCompleted: 4,
					progressTotal: 4,
					priority: "high",
				},
			])
			.returning()

		console.log(`✅ Seeded ${sampleTasks.length} tasks`)

		// Assign users to tasks
		console.log("Creating task assignments...")
		await db.insert(taskAssignees).values([
			{ taskId: sampleTasks[1].id, userId: insertedUsers[0].id }, // Design system - User 1
			{ taskId: sampleTasks[1].id, userId: insertedUsers[1].id }, // Design system - User 2
			{ taskId: sampleTasks[2].id, userId: insertedUsers[3].id }, // Search features - User 4
			{ taskId: sampleTasks[3].id, userId: insertedUsers[2].id }, // Payment gateway - User 3
			{ taskId: sampleTasks[3].id, userId: insertedUsers[3].id }, // Payment gateway - User 4
			{ taskId: sampleTasks[5].id, userId: insertedUsers[0].id }, // Conversion rate - User 1
			{ taskId: sampleTasks[5].id, userId: insertedUsers[3].id }, // Conversion rate - User 4
		])

		// Assign labels to tasks
		console.log("Creating task labels...")
		await db.insert(taskLabels).values([
			{ taskId: sampleTasks[0].id, labelId: "design" }, // Mobile app - Design
			{ taskId: sampleTasks[1].id, labelId: "design" }, // Design system - Design
			{ taskId: sampleTasks[1].id, labelId: "new-features" }, // Design system - New Features
			{ taskId: sampleTasks[2].id, labelId: "product" }, // Search features - Product
			{ taskId: sampleTasks[3].id, labelId: "product" }, // Payment gateway - Product
			{ taskId: sampleTasks[5].id, labelId: "marketing" }, // Conversion rate - Marketing
		])

		console.log("✅ Database seeded successfully!")
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
