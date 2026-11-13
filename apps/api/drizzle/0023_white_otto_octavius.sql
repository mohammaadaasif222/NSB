ALTER TABLE "listings" ADD COLUMN "artist" jsonb;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "faqs" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "service_area" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "included_services" text[] DEFAULT '{}'::text[] NOT NULL;