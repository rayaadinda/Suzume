ALTER TABLE "tasks" ADD COLUMN "is_recurring" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "recurrence_pattern" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "recurrence_interval" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "recurrence_days" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "recurrence_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "parent_recurring_task_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "time_block_start" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "time_block_end" text;