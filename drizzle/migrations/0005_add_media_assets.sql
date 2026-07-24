CREATE TABLE IF NOT EXISTS "media_assets" (
  "id" bigserial PRIMARY KEY,
  "title" varchar(200) NOT NULL,
  "image_url" text NOT NULL,
  "alt_text" varchar(200),
  "file_size_kb" integer,
  "width_px" smallint,
  "height_px" smallint,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz,
  "created_by" bigint,
  "updated_by" bigint
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "media_assets"
    ADD CONSTRAINT "media_assets_created_by_admin_users_id_fk"
    FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id")
    ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "media_assets"
    ADD CONSTRAINT "media_assets_updated_by_admin_users_id_fk"
    FOREIGN KEY ("updated_by") REFERENCES "public"."admin_users"("id")
    ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_media_assets_recent"
  ON "media_assets" ("created_at" DESC)
  WHERE "deleted_at" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_media_assets_title"
  ON "media_assets" ("title")
  WHERE "deleted_at" IS NULL;
