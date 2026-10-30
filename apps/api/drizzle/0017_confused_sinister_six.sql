ALTER TABLE "listings" ADD COLUMN "top_rank" integer;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "is_elite" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "listings_category_top_rank_idx" ON "listings" USING btree ("category_id","top_rank");