CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
-- The text a search looks through, one field per line, so a match cannot run across two fields.
-- array_to_string is only STABLE in general, but it is immutable for text, which indexes need.
CREATE OR REPLACE FUNCTION search_text(fields text[], tags text[]) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE
  AS $$ SELECT array_to_string(fields || tags, E'\n') $$;--> statement-breakpoint
CREATE INDEX "listings_search_idx" ON "listings" USING gin (search_text(array[name, area, locality, short_description], tags) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "projects_search_idx" ON "projects" USING gin (search_text(array[name, builder, advertiser_name, locality], tags) gin_trgm_ops);
