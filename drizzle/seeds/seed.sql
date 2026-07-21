-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: site_settings
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO site_settings
    (phone_display, whatsapp_number, office_address, cs_name, ppiu_license, maps_embed_url)
VALUES
    ('0813-1201-7883', '6281312017883',
     'Jl. Cihapit No. 41, Kota Bandung 40114, Jawa Barat',
     'Bayu Muharram',
     'SK PPIU No. U.108 Tahun 2021',
     'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.8!2d107.6186!3d-6.9147!...')
;

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: admin_users
-- ─────────────────────────────────────────────────────────────────────────────
-- Default password for all seed users: Admin123!
INSERT INTO admin_users (full_name, email, password_hash, role) VALUES
    ('System Administrator', 'admin@ssumroh.id',
     '$2b$12$XspS1EccaCILlwRlZlKKzuU5z/oW1HX89toCiiqKIN3799ZJkVWga', 'super_admin'),
    ('Bayu Muharram', 'bayu@ssumroh.id',
     '$2b$12$XspS1EccaCILlwRlZlKKzuU5z/oW1HX89toCiiqKIN3799ZJkVWga', 'admin'),
    ('Sari Rahayu', 'sari@ssumroh.id',
     '$2b$12$XspS1EccaCILlwRlZlKKzuU5z/oW1HX89toCiiqKIN3799ZJkVWga', 'editor'),
    ('Rini Fitriani', 'rini@ssumroh.id',
     '$2b$12$XspS1EccaCILlwRlZlKKzuU5z/oW1HX89toCiiqKIN3799ZJkVWga', 'cs_agent');

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: packages
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO packages
    (slug, name, category, tag_line, description, hotel_distance_m, flight_type,
     price_mode, price_display_text, cover_image_url, is_featured, is_active, display_order, created_by)
VALUES
    ('hemat', 'Umroh Hemat', 'hemat', 'Terjangkau',
     'Direct flight, hotel bintang 3+ dengan jarak berjalan kaki ke masjid. Solusi terbaik untuk ibadah umroh berkualitas dengan harga yang terjangkau.',
     500, 'Direct ✈', 'contact', 'Hubungi CS', NULL, FALSE, TRUE, 1, 1),

    ('bintang4', 'Umroh Bintang 4', 'bintang4', 'Paling Populer',
     'Hotel 350m dari Masjid Nabawi dan Masjidil Haram. Penerbangan direct tanpa transit. Layanan terbaik SS Umroh.',
     350, 'Direct ✈', 'contact', 'Hubungi CS', NULL, TRUE, TRUE, 2, 1),

    ('tabungan', 'Tabungan Umroh', 'tabungan', 'Cicilan Syariah',
     'Daftarkan diri sekarang, cicil via BNI. Keberangkatan terjadwal fleksibel. Mulai menabung hari ini.',
     350, 'Direct ✈', 'contact', 'Hubungi CS', NULL, FALSE, TRUE, 3, 1),

    ('ramadhan', 'Umroh Ramadhan', 'ramadhan', 'Bulan Mulia',
     'Beribadah di bulan Ramadhan di Tanah Suci bersama SS Umroh. Khusyuk dan berkesan.',
     350, 'Direct ✈', 'contact', 'Hubungi CS', NULL, FALSE, TRUE, 4, 1),

    ('group', 'Umroh Group', 'group', 'Min. 10 Orang',
     'Program umroh group untuk perusahaan, komunitas, dan organisasi. Koordinasi profesional, harga spesial.',
     350, 'Direct ✈', 'contact', 'Hubungi CS', NULL, FALSE, TRUE, 5, 1)
;

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: halal_destinations
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO halal_destinations
    (country_name, flag_emoji, badge_label, description, duration_text,
     best_season, starting_price_text, cover_image_url, is_active, display_order, created_by)
VALUES
    ('Turki', '🇹🇷', '🔥 Terpopuler',
     'Istanbul, Cappadocia, Efesus, Pamukkale. Peradaban Islam terbesar — masjid agung, bazaar bersejarah, keindahan alam.',
     '10D7N', 'Mar–Mei, Sep–Nov', 'Rp 15,5 Jt',
     'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80',
     TRUE, 1, 1),

    ('Jepang', '🇯🇵', '⭐ Premium',
     'Tokyo, Kyoto, Osaka, Fuji. Harmoni budaya modern dan tradisi. Kuliner halal semakin mudah ditemukan.',
     '9D6N', 'Mar–Apr, Okt–Nov', 'Rp 22 Jt',
     'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80',
     TRUE, 2, 1),

    ('Korea Selatan', '🇰🇷', '✨ Trending',
     'Seoul, Jeju, Busan. Budaya K-pop, istana bersejarah, street food halal. Favorit keluarga muda Muslim.',
     '7D5N', 'Sep–Nov, Mar–Mei', 'Rp 17 Jt',
     'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=600&q=80',
     TRUE, 3, 1),

    ('Uzbekistan', '🇺🇿', '🕌 Islamic Heritage',
     'Samarkand, Bukhara, Tashkent. Warisan peradaban Islam jalur sutra — madrasah dan situs bersejarah.',
     '8D6N', 'Apr–Jun, Sep–Okt', 'Rp 14 Jt',
     'https://images.unsplash.com/photo-1596401057633-54a8c8e30b0b?auto=format&fit=crop&w=600&q=80',
     TRUE, 4, 1),

    ('Dubai', '🇦🇪', '💎 Luxury',
     'Dubai, Abu Dhabi, Sharjah. Kota paling ramah Muslim di dunia. Masjid megah, mall mewah, desert safari.',
     '6D4N', 'Nov–Mar', 'Rp 13 Jt',
     'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
     TRUE, 5, 1)
;

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: testimonials
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO testimonials
    (full_name, initials, city_or_role, package_name, star_rating, quote_text,
     page_context, date_collected, is_verified, is_active, display_order, created_by)
VALUES
    ('Ghifar Fajri Sofwan', 'GF', 'Bandung', 'Paket Bintang 4', 5,
     'Penerbangan tanpa transit, hotel bintang 4. Alhamdulillah saya dan istri nyaman sekali, baik dalam perjalanan maupun di Mekkah sana.',
     'general', '2024-11-20', TRUE, TRUE, 1, 1),

    ('Kusnadi', 'KS', 'Bandung', 'Paket Umroh', 5,
     'Barakallah. Terima kasih banyak untuk tim SS Travel yang memberikan pelayanan secara profesional, ramah, baik, humoris, dan friendly.',
     'general', '2024-10-15', TRUE, TRUE, 2, 1),

    ('Hj. Susi Fatimah', 'SF', 'Garut', 'Paket Umroh Ramadhan', 5,
     'Sholat tarawih di Masjidil Haram bersama suami — impian 20 tahun terwujud. Koordinasi SS Umroh sangat luar biasa, tidak ada yang terlewat.',
     'general', '2025-03-31', TRUE, TRUE, 3, 1)
;

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: faqs
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO faqs
    (question, answer, category, is_active, display_order, created_by)
VALUES
    ('Apakah SS Umroh sudah berizin resmi dari Kemenag?',
     'Ya. SS Umroh (PT. Sarana Sadaya) terdaftar resmi sebagai PPIU di Kemenag RI dengan nomor SK PPIU No. U.108 Tahun 2021. Izin ini dapat diverifikasi di portal resmi Kemenag RI.',
     'general', TRUE, 1, 1),
    ('Apakah ada penerbangan direct tanpa transit?',
     'Ya. SS Umroh mengutamakan penerbangan direct Jakarta–Madinah (PP) tanpa transit untuk menghemat waktu dan tenaga jamaah. Tersedia via Saudi Airlines dan Garuda Indonesia.',
     'general', TRUE, 2, 1),
    ('Berapa jarak hotel dari masjid?',
     'SS Umroh memilih hotel maksimal 350m dari masjid. Di Madinah: Nozol Munawaroh (350m dari Masjid Nabawi). Di Mekkah: Le Meridien Ajyad (350m dari Masjidil Haram). Jamaah bisa jalan kaki kapan saja.',
     'general', TRUE, 3, 1)

;