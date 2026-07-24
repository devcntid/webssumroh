/**
 * Insert agent/mitra umroh packages + departure schedules; clear package caches.
 * Usage: npx tsx scripts/seed-agent-packages.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";

type PackageSeed = {
  slug: string;
  name: string;
  category: "hemat" | "bintang4";
  tag_line: string;
  description: string;
  detail_text: string;
  flight_type: string;
  price_idr: number;
  price_display_text: string;
  display_order: number;
  schedules: Array<{
    departure_date: string;
    return_date: string;
    airline: string;
    total_seats: number;
  }>;
};

const PACKAGES: PackageSeed[] = [
  {
    slug: "reguler-agen-9d-b3-garuda-sep-2026",
    name: "Paket Reguler Agen/Mitra 9D (Bintang 3)",
    category: "hemat",
    tag_line: "7 Sep 2026 · Garuda",
    description:
      "Paket reguler khusus agen/mitra SS Umroh 9 hari by Garuda dengan hotel bintang 3.",
    detail_text: [
      "Program 9 Hari by Garuda JED–JED",
      "Khusus Agen/Mitra SS Umroh",
      "Keberangkatan: 7 September 2026",
      "Min. 30 pax (FOC 1)",
      "",
      "HARGA /pax",
      "• QUAD: Rp 34.500.000",
      "• TRIPLE: Rp 36.500.000",
      "• DOUBLE: Rp 38.500.000",
      "",
      "HOTEL",
      "• Madinah: Maysan Rehab Al Mysk / Setaraf B3 (3 malam)",
      "• Mekkah: Maysan Al Maqam / Setaraf B3 (4 malam)",
      "",
      "SUDAH TERMASUK",
      "1. Tiket GA Ekonomi PP",
      "2. Visa Umrah",
      "3. Siskopatuh",
      "4. Asuransi",
      "5. Hotel dan makan sesuai paket",
      "6. Transport di Saudi",
      "7. Pembimbing",
      "8. Muthawif",
      "9. City Tour Thaif",
      "10. Perlengkapan reguler",
      "11. Manasik",
      "12. Transport Bandung–Jakarta PP",
      "13. Lounge bandara",
      "",
      "BELUM TERMASUK",
      "1. Pengurusan paspor & vaksin",
      "2. Pengeluaran pribadi jamaah",
      "3. Kelebihan bagasi",
      "4. Kereta cepat",
      "5. Pengeluaran lain di luar include",
    ].join("\n"),
    flight_type: "Garuda JED–JED · 9 Hari",
    price_idr: 34500000,
    price_display_text: "Mulai Rp 34.500.000",
    display_order: 10,
    schedules: [
      {
        departure_date: "2026-09-07",
        return_date: "2026-09-15",
        airline: "Garuda Indonesia",
        total_seats: 30,
      },
    ],
  },
  {
    slug: "reguler-agen-9d-b3-qatar-okt-2026",
    name: "Paket Reguler Agen/Mitra 9D (Bintang 3)",
    category: "hemat",
    tag_line: "15 & 28 Okt 2026 · Qatar",
    description:
      "Paket reguler khusus agen/mitra SS Umroh 9 hari by Qatar dengan hotel bintang 3.",
    detail_text: [
      "Program 9 Hari by Qatar JED–JED",
      "Khusus Agen/Mitra SS Umroh",
      "Keberangkatan: 15 & 28 Oktober 2026",
      "Min. 45 pax (FOC 1)",
      "",
      "HARGA /pax",
      "• QUAD: Rp 29.000.000",
      "• TRIPLE: Rp 30.500.000",
      "• DOUBLE: Rp 32.000.000",
      "",
      "HOTEL",
      "• Madinah: Al Mukhtara Al Gharbi / Setaraf B3 (3 malam)",
      "• Mekkah: Badr Al Masa / Setaraf B3 (4 malam)",
      "",
      "SUDAH TERMASUK",
      "1. Tiket Qatar Ekonomi PP",
      "2. Visa Umrah",
      "3. Siskopatuh",
      "4. Asuransi",
      "5. Hotel dan makan sesuai paket",
      "6. Transport di Saudi",
      "7. Tour Leader",
      "8. Muthawif",
      "9. City Tour Thaif",
      "10. Perlengkapan reguler",
      "11. Manasik",
      "12. Transport Bandung–Jakarta PP",
      "13. Lounge bandara",
      "",
      "BELUM TERMASUK",
      "1. Pengurusan paspor & vaksin",
      "2. Pengeluaran pribadi jamaah",
      "3. Kelebihan bagasi",
      "4. Kereta cepat",
      "5. Pengeluaran lain di luar include",
    ].join("\n"),
    flight_type: "Qatar JED–JED · 9 Hari",
    price_idr: 29000000,
    price_display_text: "Mulai Rp 29.000.000",
    display_order: 11,
    schedules: [
      {
        departure_date: "2026-10-15",
        return_date: "2026-10-23",
        airline: "Qatar Airways",
        total_seats: 45,
      },
      {
        departure_date: "2026-10-28",
        return_date: "2026-11-05",
        airline: "Qatar Airways",
        total_seats: 45,
      },
    ],
  },
  {
    slug: "reguler-agen-9d-b4-saudia-nov-2026",
    name: "Paket Reguler Agen/Mitra 9D (Bintang 4)",
    category: "bintang4",
    tag_line: "10, 21 & 29 Nov 2026 · Saudia",
    description:
      "Paket reguler khusus agen/mitra SS Umroh 9 hari by Saudia dengan hotel bintang 4.",
    detail_text: [
      "Program 9 Hari by Saudia (SV) JED–JED",
      "Khusus Agen/Mitra SS Umroh",
      "Keberangkatan: 10, 21 & 29 November 2026",
      "Min. 40 pax (FOC 1)",
      "",
      "HARGA /pax",
      "• QUAD: Rp 35.500.000",
      "• TRIPLE: Rp 37.500.000",
      "• DOUBLE: Rp 40.500.000",
      "",
      "HOTEL",
      "• Madinah: Maysan Rehab Al Mysk / Setaraf B4 (3 malam)",
      "• Mekkah: Maysan Al Mashaer / Setaraf B4 (4 malam)",
      "",
      "SUDAH TERMASUK",
      "1. Tiket SV Ekonomi PP",
      "2. Visa Umrah",
      "3. Siskopatuh",
      "4. Asuransi",
      "5. Hotel dan makan sesuai paket",
      "6. Transport di Saudi",
      "7. Pembimbing",
      "8. Muthawif",
      "9. City Tour Thaif",
      "10. Perlengkapan reguler",
      "11. Manasik",
      "12. Transport Bandung–Jakarta PP",
      "13. Lounge bandara",
      "14. Kereta cepat",
      "",
      "BELUM TERMASUK",
      "1. Pengurusan paspor & vaksin",
      "2. Pengeluaran pribadi jamaah",
      "3. Kelebihan bagasi",
      "4. Pengeluaran lain di luar include",
    ].join("\n"),
    flight_type: "Saudia (SV) JED–JED · 9 Hari",
    price_idr: 35500000,
    price_display_text: "Mulai Rp 35.500.000",
    display_order: 12,
    schedules: [
      {
        departure_date: "2026-11-10",
        return_date: "2026-11-18",
        airline: "Saudia",
        total_seats: 40,
      },
      {
        departure_date: "2026-11-21",
        return_date: "2026-11-29",
        airline: "Saudia",
        total_seats: 40,
      },
      {
        departure_date: "2026-11-29",
        return_date: "2026-12-07",
        airline: "Saudia",
        total_seats: 40,
      },
    ],
  },
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const sql = neon(process.env.DATABASE_URL);

  for (const pkg of PACKAGES) {
    const existing = await sql`
      SELECT id FROM packages
      WHERE slug = ${pkg.slug} AND deleted_at IS NULL
      LIMIT 1
    `;

    let packageId: number;
    if (existing[0]?.id) {
      packageId = Number(existing[0].id);
      await sql`
        UPDATE packages SET
          name = ${pkg.name},
          category = ${pkg.category},
          tag_line = ${pkg.tag_line},
          description = ${pkg.description},
          detail_text = ${pkg.detail_text},
          flight_type = ${pkg.flight_type},
          price_mode = 'number',
          price_idr = ${pkg.price_idr},
          price_display_text = ${pkg.price_display_text},
          is_active = TRUE,
          display_order = ${pkg.display_order},
          updated_at = NOW()
        WHERE id = ${packageId}
      `;
      console.log(`Updated package: ${pkg.slug}`);
    } else {
      const inserted = await sql`
        INSERT INTO packages (
          slug, name, category, tag_line, description, detail_text, hotel_distance_m, flight_type,
          price_mode, price_idr, price_display_text, cover_image_url,
          is_featured, is_active, display_order
        ) VALUES (
          ${pkg.slug}, ${pkg.name}, ${pkg.category}, ${pkg.tag_line}, ${pkg.description},
          ${pkg.detail_text}, NULL, ${pkg.flight_type}, 'number', ${pkg.price_idr},
          ${pkg.price_display_text}, NULL, FALSE, TRUE, ${pkg.display_order}
        )
        RETURNING id
      `;
      packageId = Number(inserted[0].id);
      console.log(`Created package: ${pkg.slug}`);
    }

    for (const schedule of pkg.schedules) {
      const found = await sql`
        SELECT id FROM departure_schedules
        WHERE package_id = ${packageId}
          AND departure_date = ${schedule.departure_date}
          AND deleted_at IS NULL
        LIMIT 1
      `;
      if (found[0]?.id) {
        await sql`
          UPDATE departure_schedules SET
            return_date = ${schedule.return_date},
            airline = ${schedule.airline},
            total_seats = ${schedule.total_seats},
            seats_remaining = ${schedule.total_seats},
            status = 'upcoming',
            updated_at = NOW()
          WHERE id = ${found[0].id}
        `;
        console.log(`  Updated schedule ${schedule.departure_date}`);
      } else {
        await sql`
          INSERT INTO departure_schedules (
            package_id, departure_date, return_date, departure_city, airline,
            total_seats, seats_remaining, status
          ) VALUES (
            ${packageId}, ${schedule.departure_date}, ${schedule.return_date}, 'CGK',
            ${schedule.airline}, ${schedule.total_seats}, ${schedule.total_seats}, 'upcoming'
          )
        `;
        console.log(`  Created schedule ${schedule.departure_date}`);
      }
    }
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    await redis.del("packages:active", "packages:featured");
    console.log("Cleared packages Redis cache.");
  } else {
    console.log("Redis env missing — skip cache clear.");
  }

  const rows = await sql`
    SELECT slug, name, price_display_text, display_order
    FROM packages
    WHERE slug LIKE 'reguler-agen-%' AND deleted_at IS NULL
    ORDER BY display_order
  `;
  console.log("\nAgent packages in DB:");
  for (const row of rows) {
    console.log(` - [${row.display_order}] ${row.slug}: ${row.price_display_text}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
