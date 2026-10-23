CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"area" text NOT NULL,
	"locality" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"builder" text NOT NULL,
	"rera_id" text DEFAULT '' NOT NULL,
	"possession_status" text NOT NULL,
	"possession_date" text DEFAULT '' NOT NULL,
	"launch_date" text DEFAULT '' NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"units" integer,
	"land_area" text DEFAULT '' NOT NULL,
	"towers" integer,
	"about" text DEFAULT '' NOT NULL,
	"highlights" text[] DEFAULT '{}'::text[] NOT NULL,
	"configurations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"amenities" text[] DEFAULT '{}'::text[] NOT NULL,
	"specifications" jsonb NOT NULL,
	"nearby" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"advertiser" jsonb NOT NULL,
	"advertiser_name" text NOT NULL,
	"advertiser_type" text NOT NULL,
	"faqs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"photos" text[] DEFAULT '{}'::text[] NOT NULL,
	"video_url" text,
	"video_chapters" text DEFAULT '' NOT NULL,
	"videos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"brochure_url" text,
	"phone" text,
	"min_price" bigint,
	"bedrooms" integer[] DEFAULT '{}'::integer[] NOT NULL,
	"term_start" date NOT NULL,
	"term_months" integer DEFAULT 12 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"meta_title" text DEFAULT '' NOT NULL,
	"meta_description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "enquiries" ALTER COLUMN "preferred_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "source" text;--> statement-breakpoint
CREATE INDEX "projects_status_area_idx" ON "projects" USING btree ("status","area");--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "enquiries_project_idx" ON "enquiries" USING btree ("project_id");