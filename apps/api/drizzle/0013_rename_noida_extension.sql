-- Noida Extension is now called Greater Noida West, one of the three areas NSB covers.
UPDATE "listings" SET "area" = 'Greater Noida West' WHERE "area" = 'Noida Extension';--> statement-breakpoint
UPDATE "projects" SET "area" = 'Greater Noida West' WHERE "area" = 'Noida Extension';
