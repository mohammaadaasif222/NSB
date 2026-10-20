ALTER TABLE "listings" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "notify_vendor" boolean DEFAULT true NOT NULL;