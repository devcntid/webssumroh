import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

async function main() {
  console.log("Seeding database...");
  const sql = neon(process.env.DATABASE_URL!);
  const seedPath = path.join(__dirname, "../drizzle/seeds/seed.sql");
  const seedQuery = fs.readFileSync(seedPath, "utf-8");

  const statements = seedQuery.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log("Seeding completed successfully.");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
