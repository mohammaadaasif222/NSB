ALTER TABLE "listings" ADD COLUMN "packages" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "packages_title" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "packages_note" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "service_area_title" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "service_area_chips" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "service_area_note" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "things_to_know" jsonb DEFAULT '[]'::jsonb NOT NULL;