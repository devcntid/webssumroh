-- CHANGE: add logo_url for site-wide brand logo (nav, footer, etc.)
ALTER TABLE "site_settings"
  ADD COLUMN "logo_url" text;
