ALTER TABLE "enquiries" ADD COLUMN "pending_alert" jsonb;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "alert_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "next_alert_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "enquiries_alert_idx" ON "enquiries" USING btree ("next_alert_at") WHERE "enquiries"."next_alert_at" is not null;--> statement-breakpoint
CREATE INDEX "listings_browse_idx" ON "listings" USING btree ("category_id","top_rank","is_featured" DESC NULLS FIRST,"created_at" DESC NULLS FIRST,"id" DESC NULLS FIRST) WHERE "listings"."status" = 'live';--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_role_check" CHECK ("admin_users"."role" in ('super', 'admin', 'analyst', 'view'));--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_lead_status_check" CHECK ("enquiries"."lead_status" in ('new', 'contacted', 'won', 'lost'));--> statement-breakpoint
ALTER TABLE "listing_reviews" ADD CONSTRAINT "listing_reviews_source_check" CHECK ("listing_reviews"."source" in ('google', 'customer'));--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_status_check" CHECK ("listings"."status" in ('live', 'draft', 'hidden'));--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_type_check" CHECK ("projects"."type" in ('apartments', 'villas', 'independent-house', 'plots', 'builder-floor', 'penthouse', 'studio', 'commercial', 'farmhouse'));--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_status_check" CHECK ("projects"."status" in ('live', 'draft', 'hidden'));