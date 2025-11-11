CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company" text NOT NULL,
	"position" text NOT NULL,
	"status" text DEFAULT 'applied' NOT NULL,
	"applied_date" timestamp DEFAULT now() NOT NULL,
	"salary" text,
	"location" text,
	"job_url" text,
	"notes" text DEFAULT '',
	"contact_email" text,
	"contact_phone" text,
	"interview_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;