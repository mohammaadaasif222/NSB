ALTER TABLE "admin_users" ADD COLUMN "role" text DEFAULT 'super' NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "lead_status" text DEFAULT 'new' NOT NULL;