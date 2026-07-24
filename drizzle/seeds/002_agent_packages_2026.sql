-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: Paket Reguler Agen/Mitra SS Umroh 9D (2026)
-- Idempotent — safe to re-run
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO packages
    (slug, name, category, tag_line, description, hotel_distance_m, flight_type,
     price_mode, price_idr, price_display_text, cover_image_url,
     is_featured, is_active, display_order, created_by)
SELECT
    'reguler-agen-9d-b3-garuda-sep-2026',
    'Paket Reguler Agen/Mitra 9D (Bintang 3)',
    'hemat',
    '7 Sep 2026 · Garuda',
    E'Program 9 Hari by Garuda JED–JED\nKhusus Agen/Mitra SS Umroh\nKeberangkatan: 7 September 2026\nMin. 30 pax (FOC 1)\n\nHARGA /pax\n• QUAD: Rp 34.500.000\n• TRIPLE: Rp 36.500.000\n• DOUBLE: Rp 38.500.000\n\nHOTEL\n• Madinah: Maysan Rehab Al Mysk / Setaraf B3 (3 malam)\n• Mekkah: Maysan Al Maqam / Setaraf B3 (4 malam)\n\nSUDAH TERMASUK\n1. Tiket GA Ekonomi PP\n2. Visa Umrah\n3. Siskopatuh\n4. Asuransi\n5. Hotel dan makan sesuai paket\n6. Transport di Saudi\n7. Pembimbing\n8. Muthawif\n9. City Tour Thaif\n10. Perlengkapan reguler\n11. Manasik\n12. Transport Bandung–Jakarta PP\n13. Lounge bandara\n\nBELUM TERMASUK\n1. Pengurusan paspor & vaksin\n2. Pengeluaran pribadi jamaah\n3. Kelebihan bagasi\n4. Kereta cepat\n5. Pengeluaran lain di luar include',
    NULL,
    'Garuda JED–JED · 9 Hari',
    'number',
    34500000,
    'Mulai Rp 34.500.000',
    NULL,
    FALSE,
    TRUE,
    10,
    1
WHERE NOT EXISTS (
    SELECT 1 FROM packages
    WHERE slug = 'reguler-agen-9d-b3-garuda-sep-2026' AND deleted_at IS NULL
);

INSERT INTO packages
    (slug, name, category, tag_line, description, hotel_distance_m, flight_type,
     price_mode, price_idr, price_display_text, cover_image_url,
     is_featured, is_active, display_order, created_by)
SELECT
    'reguler-agen-9d-b3-qatar-okt-2026',
    'Paket Reguler Agen/Mitra 9D (Bintang 3)',
    'hemat',
    '15 & 28 Okt 2026 · Qatar',
    E'Program 9 Hari by Qatar JED–JED\nKhusus Agen/Mitra SS Umroh\nKeberangkatan: 15 & 28 Oktober 2026\nMin. 45 pax (FOC 1)\n\nHARGA /pax\n• QUAD: Rp 29.000.000\n• TRIPLE: Rp 30.500.000\n• DOUBLE: Rp 32.000.000\n\nHOTEL\n• Madinah: Al Mukhtara Al Gharbi / Setaraf B3 (3 malam)\n• Mekkah: Badr Al Masa / Setaraf B3 (4 malam)\n\nSUDAH TERMASUK\n1. Tiket Qatar Ekonomi PP\n2. Visa Umrah\n3. Siskopatuh\n4. Asuransi\n5. Hotel dan makan sesuai paket\n6. Transport di Saudi\n7. Tour Leader\n8. Muthawif\n9. City Tour Thaif\n10. Perlengkapan reguler\n11. Manasik\n12. Transport Bandung–Jakarta PP\n13. Lounge bandara\n\nBELUM TERMASUK\n1. Pengurusan paspor & vaksin\n2. Pengeluaran pribadi jamaah\n3. Kelebihan bagasi\n4. Kereta cepat\n5. Pengeluaran lain di luar include',
    NULL,
    'Qatar JED–JED · 9 Hari',
    'number',
    29000000,
    'Mulai Rp 29.000.000',
    NULL,
    FALSE,
    TRUE,
    11,
    1
WHERE NOT EXISTS (
    SELECT 1 FROM packages
    WHERE slug = 'reguler-agen-9d-b3-qatar-okt-2026' AND deleted_at IS NULL
);

INSERT INTO packages
    (slug, name, category, tag_line, description, hotel_distance_m, flight_type,
     price_mode, price_idr, price_display_text, cover_image_url,
     is_featured, is_active, display_order, created_by)
SELECT
    'reguler-agen-9d-b4-saudia-nov-2026',
    'Paket Reguler Agen/Mitra 9D (Bintang 4)',
    'bintang4',
    '10, 21 & 29 Nov 2026 · Saudia',
    E'Program 9 Hari by Saudia (SV) JED–JED\nKhusus Agen/Mitra SS Umroh\nKeberangkatan: 10, 21 & 29 November 2026\nMin. 40 pax (FOC 1)\n\nHARGA /pax\n• QUAD: Rp 35.500.000\n• TRIPLE: Rp 37.500.000\n• DOUBLE: Rp 40.500.000\n\nHOTEL\n• Madinah: Maysan Rehab Al Mysk / Setaraf B4 (3 malam)\n• Mekkah: Maysan Al Mashaer / Setaraf B4 (4 malam)\n\nSUDAH TERMASUK\n1. Tiket SV Ekonomi PP\n2. Visa Umrah\n3. Siskopatuh\n4. Asuransi\n5. Hotel dan makan sesuai paket\n6. Transport di Saudi\n7. Pembimbing\n8. Muthawif\n9. City Tour Thaif\n10. Perlengkapan reguler\n11. Manasik\n12. Transport Bandung–Jakarta PP\n13. Lounge bandara\n14. Kereta cepat\n\nBELUM TERMASUK\n1. Pengurusan paspor & vaksin\n2. Pengeluaran pribadi jamaah\n3. Kelebihan bagasi\n4. Pengeluaran lain di luar include',
    NULL,
    'Saudia (SV) JED–JED · 9 Hari',
    'number',
    35500000,
    'Mulai Rp 35.500.000',
    NULL,
    FALSE,
    TRUE,
    12,
    1
WHERE NOT EXISTS (
    SELECT 1 FROM packages
    WHERE slug = 'reguler-agen-9d-b4-saudia-nov-2026' AND deleted_at IS NULL
);

-- Departure schedules (9 hari → return = departure + 8)

INSERT INTO departure_schedules
    (package_id, departure_date, return_date, departure_city, airline,
     total_seats, seats_remaining, status, created_by)
SELECT p.id, d.departure_date::date, d.return_date::date, 'CGK', d.airline,
       d.total_seats, d.total_seats, 'upcoming', 1
FROM packages p
JOIN (
    VALUES
        ('reguler-agen-9d-b3-garuda-sep-2026', '2026-09-07', '2026-09-15', 'Garuda Indonesia', 30),
        ('reguler-agen-9d-b3-qatar-okt-2026', '2026-10-15', '2026-10-23', 'Qatar Airways', 45),
        ('reguler-agen-9d-b3-qatar-okt-2026', '2026-10-28', '2026-11-05', 'Qatar Airways', 45),
        ('reguler-agen-9d-b4-saudia-nov-2026', '2026-11-10', '2026-11-18', 'Saudia', 40),
        ('reguler-agen-9d-b4-saudia-nov-2026', '2026-11-21', '2026-11-29', 'Saudia', 40),
        ('reguler-agen-9d-b4-saudia-nov-2026', '2026-11-29', '2026-12-07', 'Saudia', 40)
) AS d(slug, departure_date, return_date, airline, total_seats)
  ON p.slug = d.slug
WHERE p.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM departure_schedules s
    WHERE s.package_id = p.id
      AND s.departure_date = d.departure_date::date
      AND s.deleted_at IS NULL
  );
