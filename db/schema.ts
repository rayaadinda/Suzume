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
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	color: text("color").notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const tasks = pgTable("tasks", {
	id: uuid("id").defaultRandom().primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull().default(""),
	statusId: text("status_id")
		.notNull()
		.references(() => statuses.id),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
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
		labelId: uuid("label_id")
			.notNull()
			.references(() => labels.id, { onDelete: "cascade" }),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.taskId, table.labelId] }),
	})
)

// ========================================
// JOB APPLICATION TRACKER TABLES
// ========================================

export const jobApplications = pgTable("job_applications", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	company: text("company").notNull(),
	position: text("position").notNull(),
	status: text("status").notNull().default("applied"),
	appliedDate: timestamp("applied_date").notNull().defaultNow(),
	salary: text("salary"),
	location: text("location"),
	jobUrl: text("job_url"),
	notes: text("notes").default(""),
	contactEmail: text("contact_email"),
	contactPhone: text("contact_phone"),
	interviewDate: timestamp("interview_date"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ========================================
// NOTES & DOCUMENTATION TABLES
// ========================================

export const noteFolders = pgTable("note_folders", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	parentId: uuid("parent_id"),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	color: text("color"),
	iconEmoji: text("icon_emoji"),
	displayOrder: integer("display_order").notNull().default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const notes = pgTable("notes", {
	id: uuid("id").defaultRandom().primaryKey(),
	title: text("title").notNull(),
	content: text("content").notNull().default("{}"),
	plainText: text("plain_text"),
	folderId: uuid("folder_id").references(() => noteFolders.id, {
		onDelete: "set null",
	}),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	isTemplate: boolean("is_template").notNull().default(false),
	templateName: text("template_name"),
	coverImage: text("cover_image"),
	iconEmoji: text("icon_emoji"),
	isPinned: boolean("is_pinned").notNull().default(false),
	isArchived: boolean("is_archived").notNull().default(false),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	lastEditedBy: uuid("last_edited_by").references(() => users.id),
})

export const noteTaskLinks = pgTable(
	"note_task_links",
	{
		noteId: uuid("note_id")
			.notNull()
			.references(() => notes.id, { onDelete: "cascade" }),
		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.noteId, table.taskId] }),
	})
)

export const noteTemplates = pgTable("note_templates", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	content: text("content").notNull().default("{}"),
	category: text("category"),
	iconEmoji: text("icon_emoji"),
	isSystem: boolean("is_system").notNull().default(false),
	userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ========================================
// RELATIONS
// ========================================

export const usersRelations = relations(users, ({ many }) => ({
	tasks: many(taskAssignees),
	sessions: many(sessions),
	accounts: many(accounts),
	notes: many(notes),
	noteFolders: many(noteFolders),
	noteTemplates: many(noteTemplates),
	jobApplications: many(jobApplications),
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
	noteLinks: many(noteTaskLinks),
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

export const noteFoldersRelations = relations(noteFolders, ({ one, many }) => ({
	user: one(users, {
		fields: [noteFolders.userId],
		references: [users.id],
	}),
	parent: one(noteFolders, {
		fields: [noteFolders.parentId],
		references: [noteFolders.id],
		relationName: "folder_parent",
	}),
	children: many(noteFolders, {
		relationName: "folder_parent",
	}),
	notes: many(notes),
}))

export const notesRelations = relations(notes, ({ one, many }) => ({
	user: one(users, {
		fields: [notes.userId],
		references: [users.id],
	}),
	folder: one(noteFolders, {
		fields: [notes.folderId],
		references: [noteFolders.id],
	}),
	lastEditor: one(users, {
		fields: [notes.lastEditedBy],
		references: [users.id],
	}),
	taskLinks: many(noteTaskLinks),
}))

export const noteTaskLinksRelations = relations(noteTaskLinks, ({ one }) => ({
	note: one(notes, {
		fields: [noteTaskLinks.noteId],
		references: [notes.id],
	}),
	task: one(tasks, {
		fields: [noteTaskLinks.taskId],
		references: [tasks.id],
	}),
}))

export const noteTemplatesRelations = relations(noteTemplates, ({ one }) => ({
	user: one(users, {
		fields: [noteTemplates.userId],
		references: [users.id],
	}),
}))

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
	user: one(users, {
		fields: [jobApplications.userId],
		references: [users.id],
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

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert

export type NoteFolder = typeof noteFolders.$inferSelect
export type NewNoteFolder = typeof noteFolders.$inferInsert

export type NoteTemplate = typeof noteTemplates.$inferSelect
export type NewNoteTemplate = typeof noteTemplates.$inferInsert

export type NoteTaskLink = typeof noteTaskLinks.$inferSelect
export type NewNoteTaskLink = typeof noteTaskLinks.$inferInsert

export type NoteWithRelations = Note & {
	user: User
	folder?: NoteFolder | null
	lastEditor?: User | null
	taskLinks: (NoteTaskLink & { task: Task })[]
}

export type JobApplication = typeof jobApplications.$inferSelect
export type NewJobApplication = typeof jobApplications.$inferInsert

export type JobApplicationWithRelations = JobApplication & {
	user: User
}
