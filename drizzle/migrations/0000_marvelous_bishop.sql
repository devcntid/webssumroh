CREATE TABLE "admin_users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(20) DEFAULT 'editor' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"login_fail_count" smallint DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"admin_user_id" bigint,
	"action" varchar(20) NOT NULL,
	"entity_type" varchar(60) NOT NULL,
	"entity_id" bigint,
	"changed_fields" jsonb,
	"ip_address" "inet",
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_leads" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"email" varchar(255),
	"subject" varchar(200),
	"message" text NOT NULL,
	"page_source" varchar(50),
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"agent_notes" text,
	"assigned_to" bigint,
	"responded_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "corporate_inquiries" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"company_name" varchar(200) NOT NULL,
	"contact_person" varchar(150) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"email" varchar(255),
	"estimated_pax" smallint,
	"travel_type" varchar(20) DEFAULT 'umroh' NOT NULL,
	"preferred_date" date,
	"notes" text,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"agent_notes" text,
	"assigned_to" bigint,
	"quoted_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departure_schedules" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"package_id" bigint NOT NULL,
	"departure_date" date NOT NULL,
	"return_date" date NOT NULL,
	"departure_city" varchar(10) DEFAULT 'CGK' NOT NULL,
	"airline" varchar(100),
	"total_seats" smallint NOT NULL,
	"seats_remaining" smallint NOT NULL,
	"price_override_idr" bigint,
	"status" varchar(20) DEFAULT 'upcoming' NOT NULL,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" bigint,
	"updated_by" bigint
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" varchar(20) DEFAULT 'general' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" bigint,
	"updated_by" bigint
);
--> statement-breakpoint
CREATE TABLE "gallery_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"thumbnail_url" text,
	"alt_text" varchar(200) NOT NULL,
	"caption" text,
	"category" varchar(20) DEFAULT 'general' NOT NULL,
	"file_size_kb" integer,
	"width_px" smallint,
	"height_px" smallint,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" bigint
);
--> statement-breakpoint
CREATE TABLE "halal_destinations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"country_name" varchar(100) NOT NULL,
	"flag_emoji" varchar(10),
	"badge_label" varchar(60),
	"description" text,
	"duration_text" varchar(30),
	"best_season" varchar(80),
	"starting_price_text" varchar(40),
	"cover_image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" bigint,
	"updated_by" bigint
);
--> statement-breakpoint
CREATE TABLE "halal_packages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"destination_id" bigint NOT NULL,
	"name" varchar(200) NOT NULL,
	"tag_line" varchar(60),
	"is_featured" boolean DEFAULT false NOT NULL,
	"seats_remaining" smallint,
	"meta_chips" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"highlights_text" text,
	"price_display_text" varchar(40),
	"price_idr" bigint,
	"cover_image_url" text,
	"departure_month" varchar(30),
	"departure_date" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" bigint,
	"updated_by" bigint
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"category" varchar(30) NOT NULL,
	"tag_line" varchar(60),
	"description" text,
	"hotel_distance_m" smallint,
	"flight_type" varchar(60) DEFAULT 'Direct ✈',
	"price_mode" varchar(20) DEFAULT 'contact' NOT NULL,
	"price_idr" bigint,
	"price_display_text" varchar(60),
	"cover_image_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" bigint,
	"updated_by" bigint
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"phone_display" varchar(30) DEFAULT '0813-1201-7883' NOT NULL,
	"whatsapp_number" varchar(20) DEFAULT '6281312017883' NOT NULL,
	"office_address" text DEFAULT 'Jl. Cihapit No. 41, Kota Bandung' NOT NULL,
	"cs_name" varchar(100) DEFAULT 'Bayu Muharram' NOT NULL,
	"ppiu_license" varchar(100) DEFAULT 'SK PPIU No. U.108 Tahun 2021' NOT NULL,
	"maps_embed_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" bigint
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"role_title" varchar(100) NOT NULL,
	"department" varchar(40) DEFAULT 'Operations' NOT NULL,
	"photo_url" text,
	"bio" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" bigint
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"initials" varchar(4) NOT NULL,
	"city_or_role" varchar(100),
	"package_name" varchar(120),
	"star_rating" smallint DEFAULT 5 NOT NULL,
	"quote_text" text NOT NULL,
	"page_context" varchar(20) DEFAULT 'general' NOT NULL,
	"date_collected" date,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" bigint,
	"updated_by" bigint
);
