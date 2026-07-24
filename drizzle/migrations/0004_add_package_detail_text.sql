-- CHANGE: long-form package details (pricing/hotels/include) separate from short card description
ALTER TABLE "packages" ADD COLUMN "detail_text" text;

-- Move existing long agent-package descriptions into detail_text and set a short blurb
UPDATE packages
SET
  detail_text = description,
  description = 'Paket reguler khusus agen/mitra SS Umroh dengan fasilitas lengkap.'
WHERE slug LIKE 'reguler-agen-%'
  AND deleted_at IS NULL
  AND description IS NOT NULL
  AND length(description) > 200;
