ALTER TABLE "listings" ADD COLUMN "locality" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "details" jsonb DEFAULT '{}'::jsonb NOT NULL;