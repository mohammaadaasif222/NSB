ALTER TABLE "enquiries" ADD COLUMN "read_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "enquiries_unread_idx" ON "enquiries" USING btree ("created_at") WHERE "enquiries"."read_at" is null;--> statement-breakpoint
-- Leads received before read tracking existed were already visible in the admin panel.
UPDATE "enquiries" SET "read_at" = "created_at" WHERE "read_at" IS NULL;