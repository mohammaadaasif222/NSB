CREATE TABLE "listing_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"rating" integer NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"review_date" date,
	"source" text NOT NULL,
	"is_verified" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "status" text DEFAULT 'live' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "service_groups" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "google_rating" real;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "google_review_count" integer;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "google_maps_url" text;--> statement-breakpoint
ALTER TABLE "listing_reviews" ADD CONSTRAINT "listing_reviews_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_reviews_listing_idx" ON "listing_reviews" USING btree ("listing_id");