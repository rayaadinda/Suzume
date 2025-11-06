import {
	pgTable,
	text,
	timestamp,
	integer,
	uuid,
	primaryKey,
	boolean,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ========================================
// AUTH TABLES (Better Auth)
// ========================================

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const accounts = pgTable("accounts", {
	id: uuid("id").defaultRandom().primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	expiresAt: timestamp("expires_at"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const verifications = pgTable("verifications", {
	id: uuid("id").defaultRandom().primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
})

// ========================================
// TASK MANAGEMENT TABLES
// ========================================

export const statuses = pgTable("statuses", {
	id: text("id").primaryKey(), // 'backlog', 'to-do', etc.
	name: text("name").notNull(),
	color: text("color").notNull(),
	displayOrder: integer("display_order").notNull(),
})

export const labels = pgTable("labels", {
	id: text("id").primaryKey(), // 'design', 'marketing', etc.
	name: text("name").notNull(),
	color: text("color").notNull(),
})

export const tasks = pgTable("tasks", {
	id: uuid("id").defaultRandom().primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull().default(""),
	statusId: text("status_id")
		.notNull()
		.references(() => statuses.id),
	date: text("date"), // Date string like "Feb 10"
	commentsCount: integer("comments_count").notNull().default(0),
	attachmentsCount: integer("attachments_count").notNull().default(0),
	linksCount: integer("links_count").notNull().default(0),
	progressCompleted: integer("progress_completed").notNull().default(0),
	progressTotal: integer("progress_total").notNull().default(0),
	priority: text("priority").notNull().default("no-priority"), // 'low', 'medium', 'high', 'urgent', 'no-priority'

	// Recurring task fields
	isRecurring: boolean("is_recurring").notNull().default(false),
	recurrencePattern: text("recurrence_pattern"), // 'daily', 'weekly', 'monthly', 'custom'
	recurrenceInterval: integer("recurrence_interval").default(1), // Every X days/weeks/months
	recurrenceDays: text("recurrence_days"), // JSON array: ['monday', 'wednesday', 'friday'] for weekly
	recurrenceEndDate: timestamp("recurrence_end_date"), // When to stop generating
	parentRecurringTaskId: uuid("parent_recurring_task_id"), // Link to original recurring task

	// Time blocking fields for daily planning
	timeBlockStart: text("time_block_start"), // e.g., "09:00"
	timeBlockEnd: text("time_block_end"), // e.g., "10:30"

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Subtasks table for checklists within tasks
export const subtasks = pgTable("subtasks", {
	id: uuid("id").defaultRandom().primaryKey(),
	taskId: uuid("task_id")
		.notNull()
		.references(() => tasks.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	completed: boolean("completed").notNull().default(false),
	displayOrder: integer("display_order").notNull().default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Junction table for many-to-many relationship between tasks and users (assignees)
export const taskAssignees = pgTable(
	"task_assignees",
	{
		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.taskId, table.userId] }),
	})
)

// Junction table for many-to-many relationship between tasks and labels
export const taskLabels = pgTable(
	"task_labels",
	{
		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		labelId: text("label_id")
			.notNull()
			.references(() => labels.id, { onDelete: "cascade" }),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.taskId, table.labelId] }),
	})
)

// ========================================
// RELATIONS
// ========================================

export const usersRelations = relations(users, ({ many }) => ({
	tasks: many(taskAssignees),
	sessions: many(sessions),
	accounts: many(accounts),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
	status: one(statuses, {
		fields: [tasks.statusId],
		references: [statuses.id],
	}),
	assignees: many(taskAssignees),
	labels: many(taskLabels),
	subtasks: many(subtasks),
}))

export const statusesRelations = relations(statuses, ({ many }) => ({
	tasks: many(tasks),
}))

export const labelsRelations = relations(labels, ({ many }) => ({
	tasks: many(taskLabels),
}))

export const taskAssigneesRelations = relations(taskAssignees, ({ one }) => ({
	task: one(tasks, {
		fields: [taskAssignees.taskId],
		references: [tasks.id],
	}),
	user: one(users, {
		fields: [taskAssignees.userId],
		references: [users.id],
	}),
}))

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
	task: one(tasks, {
		fields: [taskLabels.taskId],
		references: [tasks.id],
	}),
	label: one(labels, {
		fields: [taskLabels.labelId],
		references: [labels.id],
	}),
}))

export const subtasksRelations = relations(subtasks, ({ one }) => ({
	task: one(tasks, {
		fields: [subtasks.taskId],
		references: [tasks.id],
	}),
}))

// ========================================
// TYPE EXPORTS
// ========================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

export type Status = typeof statuses.$inferSelect
export type NewStatus = typeof statuses.$inferInsert

export type Label = typeof labels.$inferSelect
export type NewLabel = typeof labels.$inferInsert

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert

export type TaskAssignee = typeof taskAssignees.$inferSelect
export type TaskLabel = typeof taskLabels.$inferSelect

export type Subtask = typeof subtasks.$inferSelect
export type NewSubtask = typeof subtasks.$inferInsert
