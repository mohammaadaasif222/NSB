ALTER TABLE "admin_users" ADD COLUMN "reset_token_hash" text;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "reset_expires_at" timestamp with time zone;