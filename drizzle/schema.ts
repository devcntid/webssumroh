import {
  pgTable,
  bigserial,
  varchar,
  text,
  timestamp,
  boolean,
  smallint,
  bigint,
  date,
  inet,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: site_settings
// ─────────────────────────────────────────────────────────────────────────────
export const siteSettings = pgTable("site_settings", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  phone_display: varchar("phone_display", { length: 30 }).notNull().default("0813-1201-7883"),
  whatsapp_number: varchar("whatsapp_number", { length: 20 }).notNull().default("6281312017883"),
  office_address: text("office_address").notNull().default("Jl. Cihapit No. 41, Kota Bandung"),
  cs_name: varchar("cs_name", { length: 100 }).notNull().default("Bayu Muharram"),
  ppiu_license: varchar("ppiu_license", { length: 100 }).notNull().default("SK PPIU No. U.108 Tahun 2021"),
  maps_embed_url: text("maps_embed_url"),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updated_by: bigint("updated_by", { mode: "number" }), // FK to admin_users.id handled loosely or explicitly
});

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: admin_users
// ─────────────────────────────────────────────────────────────────────────────
export const adminUsers = pgTable("admin_users", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  full_name: varchar("full_name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password_hash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("editor"),
  is_active: boolean("is_active").notNull().default(true),
  last_login_at: timestamp("last_login_at", { withTimezone: true }),
  login_fail_count: smallint("login_fail_count").notNull().default(0),
  locked_until: timestamp("locked_until", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
});

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: audit_logs
// ─────────────────────────────────────────────────────────────────────────────
export const auditLogs = pgTable("audit_logs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  admin_user_id: bigint("admin_user_id", { mode: "number" }),
  action: varchar("action", { length: 20 }).notNull(),
  entity_type: varchar("entity_type", { length: 60 }).notNull(),
  entity_id: bigint("entity_id", { mode: "number" }),
  changed_fields: jsonb("changed_fields"),
  ip_address: inet("ip_address"),
  user_agent: text("user_agent"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: packages
// ─────────────────────────────────────────────────────────────────────────────
export const packages = pgTable("packages", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  category: varchar("category", { length: 30 }).notNull(),
  tag_line: varchar("tag_line", { length: 60 }),
  description: text("description"),
  hotel_distance_m: smallint("hotel_distance_m"),
  flight_type: varchar("flight_type", { length: 60 }).default("Direct ✈"),
  price_mode: varchar("price_mode", { length: 20 }).notNull().default("contact"),
  price_idr: bigint("price_idr", { mode: "number" }),
  price_display_text: varchar("price_display_text", { length: 60 }),
  cover_image_url: text("cover_image_url"),
  is_featured: boolean("is_featured").notNull().default(false),
  is_active: boolean("is_active").notNull().default(true),
  display_order: smallint("display_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
  created_by: bigint("created_by", { mode: "number" }),
  updated_by: bigint("updated_by", { mode: "number" }),
});

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: departure_schedules
// ─────────────────────────────────────────────────────────────────────────────
export const departureSchedules = pgTable("departure_schedules", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  package_id: bigint("package_id", { mode: "number" }).notNull(),
  departure_date: date("departure_date").notNull(),
  return_date: date("return_date").notNull(),
  departure_city: varchar("departure_city", { length: 10 }).notNull().default("CGK"),
  airline: varchar("airline", { length: 100 }),
  total_seats: smallint("total_seats").notNull(),
  seats_remaining: smallint("seats_remaining").notNull(),
  price_override_idr: bigint("price_override_idr", { mode: "number" }),
  status: varchar("status", { length: 20 }).notNull().default("upcoming"),
  internal_notes: text("internal_notes"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
  created_by: bigint("created_by", { mode: "number" }),
  updated_by: bigint("updated_by", { mode: "number" }),
});

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: halal_destinations
// ─────────────────────────────────────────────────────────────────────────────
export const halalDestinations = pgTable("halal_destinations", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  country_name: varchar("country_name", { length: 100 }).notNull(),
  flag_emoji: varchar("flag_emoji", { length: 10 }),
  badge_label: varchar("badge_label", { length: 60 }),
  description: text("description"),
  duration_text: varchar("duration_text", { length: 30 }),
  best_season: varchar("best_season", { length: 80 }),
  starting_price_text: varchar("starting_price_text", { length: 40 }),
  cover_image_url: text("cover_image_url"),
  is_active: boolean("is_active").notNull().default(true),
  display_order: smallint("display_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
  created_by: bigint("created_by", { mode: "number" }),
  updated_by: bigint("updated_by", { mode: "number" }),
});

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: halal_packages
// ─────────────────────────────────────────────────────────────────────────────
export const halalPackages = pgTable("halal_packages", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  destination_id: bigint("destination_id", { mode: "number" }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  tag_line: varchar("tag_line", { length: 60 }),
  is_featured: boolean("is_featured").notNull().default(false),
  seats_remaining: smallint("seats_remaining"),
  meta_chips: jsonb("meta_chips").notNull().default([]),
  highlights_text: text("highlights_text"),
  price_display_text: varchar("price_display_text", { length: 40 }),
  price_idr: bigint("price_idr", { mode: "number" }),
  cover_image_url: text("cover_image_url"),
  departure_month: varchar("departure_month", { length: 30 }),
  departure_date: date("departure_date"),
  is_active: boolean("is_active").notNull().default(true),
  display_order: smallint("display_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
  created_by: bigint("created_by", { mode: "number" }),
  updated_by: bigint("updated_by", { mode: "number" }),
});

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: testimonials
// ─────────────────────────────────────────────────────────────────────────────
export const testimonials = pgTable("testimonials", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  full_name: varchar("full_name", { length: 150 }).notNull(),
  initials: varchar("initials", { length: 4 }).notNull(),
  city_or_role: varchar("city_or_role", { length: 100 }),
  package_name: varchar("package_name", { length: 120 }),
  star_rating: smallint("star_rating").notNull().default(5),
  quote_text: text("quote_text").notNull(),
  page_context: varchar("page_context", { length: 20 }).notNull().default("general"),
  date_collected: date("date_collected"),
  is_verified: boolean("is_verified").notNull().default(false),
  is_active: boolean("is_active").notNull().default(false),
  display_order: smallint("display_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
  created_by: bigint("created_by", { mode: "number" }),
  updated_by: bigint("updated_by", { mode: "number" }),
});

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: faqs
// ─────────────────────────────────────────────────────────────────────────────
export const faqs = pgTable("faqs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 20 }).notNull().default("general"),
  is_active: boolean("is_active").notNull().default(true),
  display_order: smallint("display_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
  created_by: bigint("created_by", { mode: "number" }),
  updated_by: bigint("updated_by", { mode: "number" }),
});

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: gallery_items
// ─────────────────────────────────────────────────────────────────────────────
export const galleryItems = pgTable("gallery_items", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  image_url: text("image_url").notNull(),
  thumbnail_url: text("thumbnail_url"),
  alt_text: varchar("alt_text", { length: 200 }).notNull(),
  caption: text("caption"),
  category: varchar("category", { length: 20 }).notNull().default("general"),
  file_size_kb: integer("file_size_kb"),
  width_px: smallint("width_px"),
  height_px: smallint("height_px"),
  is_active: boolean("is_active").notNull().default(true),
  display_order: smallint("display_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
  created_by: bigint("created_by", { mode: "number" }),
});

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: team_members
// ─────────────────────────────────────────────────────────────────────────────
export const teamMembers = pgTable("team_members", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  full_name: varchar("full_name", { length: 150 }).notNull(),
  role_title: varchar("role_title", { length: 100 }).notNull(),
  department: varchar("department", { length: 40 }).notNull().default("Operations"),
  photo_url: text("photo_url"),
  bio: text("bio"),
  is_active: boolean("is_active").notNull().default(true),
  display_order: smallint("display_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
  created_by: bigint("created_by", { mode: "number" }),
});

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: contact_leads
// ─────────────────────────────────────────────────────────────────────────────
export const contactLeads = pgTable("contact_leads", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  full_name: varchar("full_name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  email: varchar("email", { length: 255 }),
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  page_source: varchar("page_source", { length: 50 }),
  status: varchar("status", { length: 20 }).notNull().default("new"),
  agent_notes: text("agent_notes"),
  assigned_to: bigint("assigned_to", { mode: "number" }),
  responded_at: timestamp("responded_at", { withTimezone: true }),
  closed_at: timestamp("closed_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────────
// TABLE: corporate_inquiries
// ─────────────────────────────────────────────────────────────────────────────
export const corporateInquiries = pgTable("corporate_inquiries", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  company_name: varchar("company_name", { length: 200 }).notNull(),
  contact_person: varchar("contact_person", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  email: varchar("email", { length: 255 }),
  estimated_pax: smallint("estimated_pax"),
  travel_type: varchar("travel_type", { length: 20 }).notNull().default("umroh"),
  preferred_date: date("preferred_date"),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).notNull().default("new"),
  agent_notes: text("agent_notes"),
  assigned_to: bigint("assigned_to", { mode: "number" }),
  quoted_at: timestamp("quoted_at", { withTimezone: true }),
  closed_at: timestamp("closed_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
