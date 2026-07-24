-- CHANGE: white logo for transparent/dark header (unscrolled)
ALTER TABLE "site_settings"
  ADD COLUMN "logo_white_url" text;
