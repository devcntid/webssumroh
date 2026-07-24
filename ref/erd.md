# Entity Relationship Document — SS Umroh Database Schema

**Version:** 1.0  
**Date:** July 2025  
**Database:** PostgreSQL 15+  
**Conventions:**
- Primary keys: `BIGSERIAL` (auto-increment 64-bit integer)
- Enumerations: `VARCHAR` with CHECK constraints (avoids migration pain of ALTER TYPE)
- Timestamps: `TIMESTAMPTZ` (UTC)
- Soft-delete: `deleted_at TIMESTAMPTZ NULL` on content tables
- All user-facing text fields: `TEXT` unless bounded

---

## 1. Entity Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  site_settings  │     │    admin_users   │     │    audit_logs      │
└─────────────────┘     └──────────────────┘     └────────────────────┘
                                │
              ┌─────────────────┼──────────────────┐
              │                 │                  │
    ┌─────────▼──────┐  ┌───────▼───────┐  ┌──────▼───────────┐
    │    packages    │  │  testimonials  │  │      faqs        │
    └────────────────┘  └───────────────┘  └──────────────────┘
              │
    ┌─────────▼──────────────┐
    │  departure_schedules   │
    └────────────────────────┘

    ┌─────────────────────┐     ┌──────────────────────┐
    │  halal_destinations │────▶│   halal_packages     │
    └─────────────────────┘     └──────────────────────┘

    ┌──────────────────┐     ┌─────────────────────────┐
    │   gallery_items  │     │     team_members        │
    └──────────────────┘     └─────────────────────────┘

    ┌───────────────────────┐     ┌───────────────────────────┐
    │    contact_leads      │     │   corporate_inquiries     │
    └───────────────────────┘     └───────────────────────────┘
```

---

## 2. Full Schema DDL

```sql
-- ─────────────────────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- fuzzy search on text fields


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: site_settings
-- Single-row configuration. Always SELECT WHERE id = 1.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE site_settings (
    id                  BIGSERIAL PRIMARY KEY,
    phone_display       VARCHAR(30)  NOT NULL DEFAULT '0813-1201-7883',
    whatsapp_number     VARCHAR(20)  NOT NULL DEFAULT '6281312017883',
    office_address      TEXT         NOT NULL DEFAULT 'Jl. Cihapit No. 41, Kota Bandung',
    cs_name             VARCHAR(100) NOT NULL DEFAULT 'Bayu Muharram',
    ppiu_license        VARCHAR(100) NOT NULL DEFAULT 'SK PPIU No. U.108 Tahun 2021',
    maps_embed_url      TEXT,
    -- Color brand logo (scrolled header, footer). NULL = default
    logo_url            TEXT,
    -- White brand logo (unscrolled header). NULL = default Logo-Putih.png
    logo_white_url      TEXT,
    -- Per-page public hero image URL and background color, keyed by route name
    hero_settings       JSONB        NOT NULL DEFAULT '{}'::jsonb,
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_by          BIGINT       -- FK to admin_users.id (nullable for seed)
);

-- Enforce single-row constraint
CREATE UNIQUE INDEX idx_site_settings_single ON site_settings ((id IS NOT NULL));


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: admin_users
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE admin_users (
    id                  BIGSERIAL    PRIMARY KEY,
    full_name           VARCHAR(150) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    password_hash       TEXT         NOT NULL,
    role                VARCHAR(20)  NOT NULL DEFAULT 'editor'
                            CHECK (role IN ('super_admin','admin','editor','cs_agent')),
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login_at       TIMESTAMPTZ,
    login_fail_count    SMALLINT     NOT NULL DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_admin_users_email ON admin_users (LOWER(email))
    WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_users_role      ON admin_users (role)       WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_users_is_active ON admin_users (is_active)  WHERE deleted_at IS NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: audit_logs
-- Append-only. No soft delete. FK to admin_users is nullable (system actions).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
    id              BIGSERIAL    PRIMARY KEY,
    admin_user_id   BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL,
    action          VARCHAR(20)  NOT NULL CHECK (action IN ('created','updated','deleted','login','logout')),
    entity_type     VARCHAR(60)  NOT NULL,   -- e.g. 'packages', 'testimonials'
    entity_id       BIGINT,
    changed_fields  JSONB,                   -- {field: [old_value, new_value], ...}
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- High-traffic read: filter by entity + date range, user
CREATE INDEX idx_audit_entity   ON audit_logs (entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_user     ON audit_logs (admin_user_id, created_at DESC);
CREATE INDEX idx_audit_created  ON audit_logs (created_at DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: packages  (Umroh packages)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE packages (
    id                  BIGSERIAL    PRIMARY KEY,
    slug                VARCHAR(80)  NOT NULL,
    name                VARCHAR(120) NOT NULL,
    category            VARCHAR(30)  NOT NULL
                            CHECK (category IN ('hemat','bintang4','tabungan','ramadhan','group')),
    tag_line            VARCHAR(60),
    description         TEXT,                 -- short card summary under title
    detail_text         TEXT,                 -- long package details (pricing, hotels, include)
    hotel_distance_m    SMALLINT     CHECK (hotel_distance_m BETWEEN 0 AND 5000),
    flight_type         VARCHAR(60)  DEFAULT 'Direct ✈',
    price_mode          VARCHAR(20)  NOT NULL DEFAULT 'contact'
                            CHECK (price_mode IN ('contact','number')),
    price_idr           BIGINT       CHECK (price_idr > 0),
    price_display_text  VARCHAR(60),          -- e.g. "Mulai Rp 15,5 Jt"
    cover_image_url     TEXT,
    is_featured         BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order       SMALLINT     NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    created_by          BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by          BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_packages_slug     ON packages (slug)          WHERE deleted_at IS NULL;
CREATE INDEX idx_packages_category       ON packages (category)       WHERE deleted_at IS NULL AND is_active;
CREATE INDEX idx_packages_featured       ON packages (is_featured)    WHERE deleted_at IS NULL AND is_active;
CREATE INDEX idx_packages_display_order  ON packages (display_order)  WHERE deleted_at IS NULL AND is_active;
-- Enforce max 1 featured package
CREATE UNIQUE INDEX idx_packages_one_featured ON packages (is_featured)
    WHERE is_featured = TRUE AND deleted_at IS NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: departure_schedules
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE departure_schedules (
    id                  BIGSERIAL    PRIMARY KEY,
    package_id          BIGINT       NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
    departure_date      DATE         NOT NULL,
    return_date         DATE         NOT NULL,
    departure_city      VARCHAR(10)  NOT NULL DEFAULT 'CGK'
                            CHECK (departure_city IN ('CGK','BDO','SUB','MLG','SRG')),
    airline             VARCHAR(100),
    total_seats         SMALLINT     NOT NULL CHECK (total_seats > 0),
    seats_remaining     SMALLINT     NOT NULL CHECK (seats_remaining >= 0),
    price_override_idr  BIGINT       CHECK (price_override_idr > 0),
    status              VARCHAR(20)  NOT NULL DEFAULT 'upcoming'
                            CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
    internal_notes      TEXT,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    created_by          BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by          BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL,
    CONSTRAINT chk_seats_not_exceed CHECK (seats_remaining <= total_seats),
    CONSTRAINT chk_return_after_departure CHECK (return_date > departure_date)
);

-- High-traffic: public site queries upcoming schedules by package and date
CREATE INDEX idx_departures_package_date ON departure_schedules (package_id, departure_date)
    WHERE deleted_at IS NULL AND status IN ('upcoming','ongoing');
CREATE INDEX idx_departures_date         ON departure_schedules (departure_date)
    WHERE deleted_at IS NULL AND status = 'upcoming';
CREATE INDEX idx_departures_low_seats    ON departure_schedules (seats_remaining)
    WHERE deleted_at IS NULL AND seats_remaining <= 5 AND status = 'upcoming';


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: halal_destinations
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE halal_destinations (
    id                  BIGSERIAL    PRIMARY KEY,
    country_name        VARCHAR(100) NOT NULL,
    flag_emoji          VARCHAR(10),
    badge_label         VARCHAR(60),
    description         TEXT,
    duration_text       VARCHAR(30),          -- "10D7N"
    best_season         VARCHAR(80),
    starting_price_text VARCHAR(40),          -- "Rp 15,5 Jt"
    cover_image_url     TEXT,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order       SMALLINT     NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    created_by          BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by          BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_halal_dest_active ON halal_destinations (display_order)
    WHERE deleted_at IS NULL AND is_active;
CREATE INDEX idx_halal_dest_search ON halal_destinations USING GIN (country_name gin_trgm_ops)
    WHERE deleted_at IS NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: halal_packages
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE halal_packages (
    id                  BIGSERIAL    PRIMARY KEY,
    destination_id      BIGINT       NOT NULL REFERENCES halal_destinations(id) ON DELETE RESTRICT,
    name                VARCHAR(200) NOT NULL,
    tag_line            VARCHAR(60),
    is_featured         BOOLEAN      NOT NULL DEFAULT FALSE,
    seats_remaining     SMALLINT     CHECK (seats_remaining >= 0),
    meta_chips          JSONB        NOT NULL DEFAULT '[]',   -- ["9D6N","Garuda Direct","Hotel Bintang 4"]
    highlights_text     TEXT,
    price_display_text  VARCHAR(40),
    price_idr           BIGINT       CHECK (price_idr > 0),
    cover_image_url     TEXT,
    departure_month     VARCHAR(30),                          -- "Mar 2026"
    departure_date      DATE,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order       SMALLINT     NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    created_by          BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by          BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_halal_pkgs_destination   ON halal_packages (destination_id)  WHERE deleted_at IS NULL AND is_active;
CREATE INDEX idx_halal_pkgs_featured      ON halal_packages (is_featured)     WHERE deleted_at IS NULL AND is_active;
CREATE INDEX idx_halal_pkgs_order         ON halal_packages (display_order)   WHERE deleted_at IS NULL AND is_active;
CREATE INDEX idx_halal_pkgs_departure     ON halal_packages (departure_date)  WHERE deleted_at IS NULL AND is_active;
CREATE INDEX idx_halal_pkgs_low_seats     ON halal_packages (seats_remaining)
    WHERE deleted_at IS NULL AND seats_remaining <= 5 AND is_active;


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: testimonials
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE testimonials (
    id                  BIGSERIAL    PRIMARY KEY,
    full_name           VARCHAR(150) NOT NULL,
    initials            VARCHAR(4)   NOT NULL,
    city_or_role        VARCHAR(100),
    package_name        VARCHAR(120),
    star_rating         SMALLINT     NOT NULL DEFAULT 5 CHECK (star_rating BETWEEN 1 AND 5),
    quote_text          TEXT         NOT NULL,
    page_context        VARCHAR(20)  NOT NULL DEFAULT 'general'
                            CHECK (page_context IN ('general','halal-tour','korporat')),
    date_collected      DATE,
    is_verified         BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN      NOT NULL DEFAULT FALSE,   -- default hidden until verified
    display_order       SMALLINT     NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    created_by          BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by          BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL
);

-- High-traffic: public site queries by context + verified + active
CREATE INDEX idx_testimonials_public   ON testimonials (page_context, display_order)
    WHERE deleted_at IS NULL AND is_verified AND is_active;
CREATE INDEX idx_testimonials_pending  ON testimonials (is_verified, created_at DESC)
    WHERE deleted_at IS NULL AND NOT is_verified;


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: faqs
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE faqs (
    id              BIGSERIAL    PRIMARY KEY,
    question        TEXT         NOT NULL,
    answer          TEXT         NOT NULL,   -- stored as plain text or minimal HTML
    category        VARCHAR(20)  NOT NULL DEFAULT 'general'
                        CHECK (category IN ('general','halal-tour','korporat')),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order   SMALLINT     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by      BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL
);

-- High-traffic: public site queries by category
CREATE INDEX idx_faqs_public   ON faqs (category, display_order) WHERE deleted_at IS NULL AND is_active;
-- Admin search
CREATE INDEX idx_faqs_search   ON faqs USING GIN (question gin_trgm_ops) WHERE deleted_at IS NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: gallery_items
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE gallery_items (
    id              BIGSERIAL    PRIMARY KEY,
    image_url       TEXT         NOT NULL,
    thumbnail_url   TEXT,
    alt_text        VARCHAR(200) NOT NULL,
    caption         TEXT,
    category        VARCHAR(20)  NOT NULL DEFAULT 'general'
                        CHECK (category IN ('umroh','halal-tour','korporat','general')),
    file_size_kb    INTEGER,
    width_px        SMALLINT,
    height_px       SMALLINT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order   SMALLINT     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL
);

-- High-traffic: gallery page queries by category
CREATE INDEX idx_gallery_public   ON gallery_items (category, display_order) WHERE deleted_at IS NULL AND is_active;
CREATE INDEX idx_gallery_recent   ON gallery_items (created_at DESC)          WHERE deleted_at IS NULL AND is_active;


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: media_assets
-- Admin media library: reusable images + public URLs for pages/forms
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE media_assets (
    id              BIGSERIAL    PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    image_url       TEXT         NOT NULL,
    alt_text        VARCHAR(200),
    file_size_kb    INTEGER,
    width_px        SMALLINT,
    height_px       SMALLINT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by      BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_media_assets_recent ON media_assets (created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_media_assets_title  ON media_assets (title) WHERE deleted_at IS NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: team_members
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE team_members (
    id              BIGSERIAL    PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    role_title      VARCHAR(100) NOT NULL,
    department      VARCHAR(40)  NOT NULL DEFAULT 'Operations'
                        CHECK (department IN ('Operations','Marketing','Customer Service','Finance','Management')),
    photo_url       TEXT,
    bio             TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order   SMALLINT     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_team_public ON team_members (department, display_order) WHERE deleted_at IS NULL AND is_active;


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: contact_leads
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE contact_leads (
    id              BIGSERIAL    PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(30)  NOT NULL,
    email           VARCHAR(255),
    subject         VARCHAR(200),
    message         TEXT         NOT NULL,
    page_source     VARCHAR(50),             -- which page the form was submitted from
    status          VARCHAR(20)  NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new','read','responded','closed')),
    agent_notes     TEXT,                    -- append-only internal log
    assigned_to     BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL,
    responded_at    TIMESTAMPTZ,
    closed_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    -- no deleted_at: leads are retained, not soft-deleted
);

-- High-traffic: inbox default view (new leads first)
CREATE INDEX idx_leads_inbox    ON contact_leads (status, created_at DESC);
CREATE INDEX idx_leads_assigned ON contact_leads (assigned_to, status) WHERE status NOT IN ('closed');
-- Search by phone/name
CREATE INDEX idx_leads_phone    ON contact_leads (phone);
CREATE INDEX idx_leads_name     ON contact_leads USING GIN (full_name gin_trgm_ops);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: corporate_inquiries
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE corporate_inquiries (
    id                  BIGSERIAL    PRIMARY KEY,
    company_name        VARCHAR(200) NOT NULL,
    contact_person      VARCHAR(150) NOT NULL,
    phone               VARCHAR(30)  NOT NULL,
    email               VARCHAR(255),
    estimated_pax       SMALLINT     CHECK (estimated_pax > 0),
    travel_type         VARCHAR(20)  NOT NULL DEFAULT 'umroh'
                            CHECK (travel_type IN ('umroh','halal-tour','both')),
    preferred_date      DATE,
    notes               TEXT,
    status              VARCHAR(20)  NOT NULL DEFAULT 'new'
                            CHECK (status IN ('new','read','responded','quoted','closed')),
    agent_notes         TEXT,
    assigned_to         BIGINT       REFERENCES admin_users(id) ON DELETE SET NULL,
    quoted_at           TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_corp_inbox    ON corporate_inquiries (status, created_at DESC);
CREATE INDEX idx_corp_phone    ON corporate_inquiries (phone);
CREATE INDEX idx_corp_assigned ON corporate_inquiries (assigned_to, status) WHERE status NOT IN ('closed');


-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER: updated_at auto-maintenance
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'admin_users','packages','departure_schedules','halal_destinations',
        'halal_packages','testimonials','faqs','gallery_items','team_members',
        'contact_leads','corporate_inquiries'
    ] LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%I_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
            tbl, tbl
        );
    END LOOP;
END;
$$;
```

---

## 3. Foreign Key Summary

| Table | FK Column | References | ON DELETE |
|-------|-----------|------------|-----------|
| `site_settings` | `updated_by` | `admin_users.id` | SET NULL |
| `audit_logs` | `admin_user_id` | `admin_users.id` | SET NULL |
| `packages` | `created_by`, `updated_by` | `admin_users.id` | SET NULL |
| `departure_schedules` | `package_id` | `packages.id` | **RESTRICT** |
| `departure_schedules` | `created_by`, `updated_by` | `admin_users.id` | SET NULL |
| `halal_destinations` | `created_by`, `updated_by` | `admin_users.id` | SET NULL |
| `halal_packages` | `destination_id` | `halal_destinations.id` | **RESTRICT** |
| `halal_packages` | `created_by`, `updated_by` | `admin_users.id` | SET NULL |
| `testimonials` | `created_by`, `updated_by` | `admin_users.id` | SET NULL |
| `faqs` | `created_by`, `updated_by` | `admin_users.id` | SET NULL |
| `gallery_items` | `created_by` | `admin_users.id` | SET NULL |
| `media_assets` | `created_by` | `admin_users.id` | SET NULL |
| `media_assets` | `updated_by` | `admin_users.id` | SET NULL |
| `team_members` | `created_by` | `admin_users.id` | SET NULL |
| `contact_leads` | `assigned_to` | `admin_users.id` | SET NULL |
| `corporate_inquiries` | `assigned_to` | `admin_users.id` | SET NULL |

**RESTRICT** is used on operational FKs (package → departures, destination → packages) to prevent orphaned data. All admin author FKs use SET NULL to preserve data integrity when a staff member is deactivated.

---

## 4. Realistic Seed Data

```sql
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
     'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.8!2d107.6186!3d-6.9147!...');


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: admin_users
-- Passwords shown in plain text for seed documentation — use bcrypt in production
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO admin_users (full_name, email, password_hash, role) VALUES
    ('System Administrator', 'admin@ssumroh.id',
     '$2b$12$LKhMJY3bV1xSeedHashSuperAdmin00001', 'super_admin'),
    ('Bayu Muharram', 'bayu@ssumroh.id',
     '$2b$12$LKhMJY3bV1xSeedHashAdmin000002xxx', 'admin'),
    ('Sari Rahayu', 'sari@ssumroh.id',
     '$2b$12$LKhMJY3bV1xSeedHashEditor00003xx', 'editor'),
    ('Rini Fitriani', 'rini@ssumroh.id',
     '$2b$12$LKhMJY3bV1xSeedHashCSAgent0004xx', 'cs_agent');


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
     350, 'Direct ✈', 'contact', 'Hubungi CS', NULL, FALSE, TRUE, 5, 1);


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: departure_schedules
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO departure_schedules
    (package_id, departure_date, return_date, departure_city, airline,
     total_seats, seats_remaining, status, created_by)
VALUES
    -- Umroh Hemat
    (1, '2025-09-10', '2025-09-19', 'CGK', 'Saudi Airlines', 45, 32, 'upcoming', 1),
    (1, '2025-10-08', '2025-10-17', 'CGK', 'Garuda Indonesia', 45, 41, 'upcoming', 1),
    (1, '2025-11-05', '2025-11-14', 'BDO', 'Saudi Airlines', 40, 40, 'upcoming', 1),

    -- Umroh Bintang 4
    (2, '2025-09-03', '2025-09-12', 'CGK', 'Garuda Indonesia', 40, 8, 'upcoming', 1),
    (2, '2025-10-01', '2025-10-10', 'CGK', 'Saudi Airlines', 40, 22, 'upcoming', 1),
    (2, '2025-12-10', '2025-12-19', 'CGK', 'Garuda Indonesia', 40, 40, 'upcoming', 1),

    -- Umroh Ramadhan
    (4, '2026-02-20', '2026-03-01', 'CGK', 'Saudi Airlines', 45, 45, 'upcoming', 1),
    (4, '2026-03-05', '2026-03-14', 'CGK', 'Garuda Indonesia', 45, 45, 'upcoming', 1);


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
     TRUE, 5, 1),

    ('Mesir', '🇪🇬', '🏛 Peradaban',
     'Kairo, Luxor, Alexandria. Piramida Giza, Masjid Al-Azhar. Peradaban kuno dan warisan Islam berpadu.',
     '9D7N', 'Okt–Apr', 'Rp 16 Jt',
     'https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=600&q=80',
     TRUE, 6, 1),

    ('Maroko', '🇲🇦', '✨ Eksotis',
     'Marrakech, Fes, Casablanca, Sahara. Medina bersejarah, riad mewah, dan lanskap yang memukau.',
     '10D8N', 'Mar–Mei, Sep–Nov', 'Rp 19 Jt',
     'https://images.unsplash.com/photo-1489493887464-892be6d1daae?auto=format&fit=crop&w=600&q=80',
     TRUE, 7, 1),

    ('Eropa Muslim Friendly', '🇪🇺', '🌍 Multi-Country',
     'Paris, Amsterdam, Barcelona. Itinerary khusus Muslim dengan daftar restoran halal dan masjid terdekat.',
     '12D10N', 'Jun–Sep', 'Rp 28 Jt',
     'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
     TRUE, 8, 1),

    ('Malaysia', '🇲🇾', '🌴 Terdekat',
     'Kuala Lumpur, Penang, Langkawi. Muslim friendly, halal food di mana-mana, dan budaya Melayu yang kental.',
     '5D3N', 'Sepanjang Tahun', 'Rp 8 Jt',
     'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80',
     TRUE, 9, 1),

    ('Madinah & Makkah', '🕌', '🌙 Umroh Plus',
     'Paket Umroh Plus Wisata: kombinasi ibadah umroh dan ziarah ke situs bersejarah Islam di Madinah dan Mekkah.',
     '12D9N', 'Sepanjang Tahun', 'Rp 25 Jt',
     'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&q=80',
     TRUE, 10, 1);


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: halal_packages
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO halal_packages
    (destination_id, name, tag_line, is_featured, seats_remaining,
     meta_chips, highlights_text, price_display_text, price_idr,
     cover_image_url, departure_month, departure_date, is_active, display_order, created_by)
VALUES
    (1, 'Halal Tour Turki — Istanbul, Cappadocia & Pamukkale', '🇹🇷 Best Seller',
     TRUE, 4,
     '["10D7N","Saudi Airlines Direct","Hotel Bintang 4","Makan 3x Halal","Feb 2026"]',
     'Blue Mosque · Hagia Sophia · Topkapi · Grand Bazaar · Cappadocia Hot Air Balloon · Pamukkale',
     'Rp 15,5 Jt', 15500000,
     'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=700&q=80',
     'Feb 2026', '2026-02-11', TRUE, 1, 1),

    (5, 'Halal Tour Dubai & Abu Dhabi', '🇦🇪 Luxury Escape',
     FALSE, 20,
     '["6D4N","Emirates Direct","Hotel Bintang 5","Makan Halal","Jan 2026"]',
     'Sheikh Zayed Mosque · Burj Khalifa · Dubai Mall · Desert Safari · Gold Souk · Palm Jumeirah',
     'Rp 13 Jt', 13000000,
     'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=80',
     'Jan 2026', '2026-01-15', TRUE, 2, 1),

    (7, 'Halal Tour Maroko — Marrakech, Fes & Sahara', '✨ Eksotis',
     FALSE, 15,
     '["10D8N","via Casablanca","Riad Bintang 4","Makan 3x","Apr 2026"]',
     'Masjid Hassan II · Medina Marrakech · Fes Medina · Todra Gorge · Sahara Desert Camp',
     'Rp 19 Jt', 19000000,
     'https://images.unsplash.com/photo-1489493887464-892be6d1daae?auto=format&fit=crop&w=700&q=80',
     'Apr 2026', '2026-04-03', TRUE, 3, 1),

    (2, 'Halal Tour Jepang — Tokyo, Kyoto, Osaka & Fuji', '⭐ Premium',
     FALSE, 6,
     '["9D6N","Garuda Direct","Hotel Bintang 4","Makan Halal","Mar 2026"]',
     'Shibuya · Senso-ji · Fuji-san · Fushimi Inari · Dotonbori · Nara · Bullet Train',
     'Rp 22 Jt', 22000000,
     'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=700&q=80',
     'Mar 2026', '2026-03-18', TRUE, 4, 1),

    (8, 'Halal Tour Eropa — Paris, Amsterdam & Barcelona', '🌍 Best Value',
     FALSE, 18,
     '["12D10N","via Emirates","Hotel Bintang 4","Halal Guide","Jun 2026"]',
     'Eiffel Tower · Louvre · Rijksmuseum · Keukenhof · Sagrada Familia · 50+ Halal Restaurants',
     'Rp 28 Jt', 28000000,
     'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=700&q=80',
     'Jun 2026', '2026-06-05', TRUE, 5, 1);


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
     'general', '2025-03-31', TRUE, TRUE, 3, 1),

    ('Rizky Hidayat & Keluarga', 'RH', 'Jakarta', 'Halal Tour Turki 2024', 5,
     'Halal tour Turki bersama SS Umroh benar-benar di luar ekspektasi kami. Tour leader sangat memperhatikan waktu sholat, semua makanan halal 100%, dan hotelnya nyaman banget.',
     'halal-tour', '2024-09-10', TRUE, TRUE, 1, 1),

    ('Dewi Wulandari', 'DW', 'HR Manager, PT. Sinar Mas', 'Halal Tour Dubai 2024', 5,
     'Rombongan kantor kami 30 orang ke Dubai. SS Umroh mengurus segalanya — visa, hotel, transport, sampai restoran halal bersertifikat. Tidak ada satu pun yang mengeluh.',
     'halal-tour', '2024-08-05', TRUE, TRUE, 2, 1),

    ('Muhammad Fauzi', 'MF', 'Bandung', 'Halal Tour Uzbekistan 2024', 5,
     'Ziarah ke makam Imam Bukhari — pengalaman spiritual yang tidak bisa dibeli. SS Umroh paham betul kebutuhan wisatawan Muslim.',
     'halal-tour', '2024-10-22', TRUE, TRUE, 3, 1),

    ('Siti Nurhaliza', 'SN', 'Surabaya', 'Halal Tour Jepang 2025', 5,
     'Jepang dengan itinerary halal friendly dari SS Umroh. Semua restoran sudah dicek, masjid terdekat sudah dipetakan. Anak-anak dan orang tua kami sangat menikmati.',
     'halal-tour', '2025-04-18', TRUE, TRUE, 4, 1),

    ('Ahmad & Putri', 'AP', 'Bekasi', 'Halal Honeymoon Maroko 2025', 5,
     'Honeymoon ke Maroko — pilihan paling tepat! Riad bintang 4 di Marrakech yang romantis, semua makan halal, itinerary couple-friendly. Kenangan terbaik dalam hidup kami.',
     'halal-tour', '2025-05-02', TRUE, TRUE, 5, 1),

    ('Yusuf Ramadhan', 'YR', 'Bandung', 'Halal Tour Eropa 2025', 5,
     'Masjid Agung Cordoba, Alhambra Granada, semua dalam satu paket Eropa Muslim Friendly SS Umroh. Ini bukan tour biasa — ini perjalanan menelusuri kejayaan Islam di Eropa.',
     'halal-tour', '2025-06-15', TRUE, TRUE, 6, 1),

    ('PT. Amanah Sejahtera', 'AS', 'General Manager, PT. Amanah Sejahtera', 'Umroh Korporat 2024', 5,
     'Kami memberangkatkan 120 karyawan melalui SS Umroh. Profesionalisme tim sangat terasa — dari manasik massal hingga pendampingan di sana. Zero complaint dari semua peserta.',
     'korporat', '2024-12-10', TRUE, TRUE, 1, 1);


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: faqs
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO faqs (question, answer, category, is_active, display_order, created_by)
VALUES
    ('Apakah SS Umroh sudah berizin resmi dari Kemenag?',
     'Ya. SS Umroh (PT. Sarana Sadaya) terdaftar resmi sebagai PPIU di Kemenag RI dengan nomor SK PPIU No. U.108 Tahun 2021. Izin ini dapat diverifikasi di portal resmi Kemenag RI.',
     'general', TRUE, 1, 1),

    ('Apakah ada penerbangan direct tanpa transit?',
     'Ya. SS Umroh mengutamakan penerbangan direct Jakarta–Madinah (PP) tanpa transit untuk menghemat waktu dan tenaga jamaah. Tersedia via Saudi Airlines dan Garuda Indonesia.',
     'general', TRUE, 2, 1),

    ('Berapa jarak hotel dari masjid?',
     'SS Umroh memilih hotel maksimal 350m dari masjid. Di Madinah: Nozol Munawaroh (350m dari Masjid Nabawi). Di Mekkah: Le Meridien Ajyad (350m dari Masjidil Haram). Jamaah bisa jalan kaki kapan saja.',
     'general', TRUE, 3, 1),

    ('Apakah harga paket sudah termasuk tiket pesawat?',
     'Ya. Semua paket SS Umroh sudah termasuk tiket pesawat PP, hotel, makan 3x sehari, manasik, perlengkapan, visa, dan bimbingan ustadz. Hubungi CS untuk harga terkini.',
     'general', TRUE, 4, 1),

    ('Berapa maksimal jamaah per rombongan?',
     'SS Umroh membatasi maksimal 45 jamaah per rombongan agar setiap jamaah mendapat perhatian penuh dari koordinator dan ustadz pembimbing.',
     'general', TRUE, 5, 1),

    ('Apakah ada manasik sebelum berangkat?',
     'Ya. SS Umroh mengadakan manasik intensif 1 minggu sebelum keberangkatan di hotel berbintang di Bandung. Manasik dipimpin ustadz berpengalaman.',
     'general', TRUE, 6, 1),

    ('Bagaimana cara mendaftar paket umroh SS Umroh?',
     'Hubungi CS kami Bayu Muharram via WhatsApp 0813-1201-7883. Konsultasi gratis, tanpa tekanan. Kami bantu pilihkan paket yang paling sesuai dengan kebutuhan dan budget Anda.',
     'general', TRUE, 7, 1),

    ('Apakah makanan dijamin halal di semua destinasi?',
     'Ya. SS Umroh sudah memetakan dan menyeleksi restoran halal bersertifikasi di setiap destinasi. Panduan kuliner halal diberikan sebelum keberangkatan, dan tour leader memastikan semua makanan selama perjalanan grup adalah halal.',
     'halal-tour', TRUE, 1, 1),

    ('Bagaimana waktu sholat selama perjalanan?',
     'Itinerary SS Umroh dirancang untuk menghormati waktu sholat 5 waktu. Tour leader memiliki jadwal sholat lokal dan memastikan ada waktu, tempat, dan musholla atau masjid terdekat di setiap destinasi.',
     'halal-tour', TRUE, 2, 1),

    ('Apakah tersedia paket private tour?',
     'Ya. SS Umroh menyediakan paket private tour untuk pasangan (honeymoon), keluarga, dan kelompok kecil. Private tour memiliki fleksibilitas penuh dalam memilih destinasi, hotel, dan jadwal.',
     'halal-tour', TRUE, 3, 1),

    ('Apakah bisa custom itinerary sesuai keinginan?',
     'Ya. Kami dengan senang hati menyesuaikan itinerary sesuai preferensi Anda — menambah hari di kota tertentu, menghilangkan destinasi yang tidak diminati, atau menambahkan aktivitas khusus.',
     'halal-tour', TRUE, 4, 1),

    ('Apakah tersedia cicilan atau pembayaran bertahap?',
     'Ya. SS Umroh bekerja sama dengan mitra pembiayaan syariah. Bayar DP untuk mengamankan kursi, lunasi sebelum keberangkatan. Hubungi CS untuk detail skema cicilan.',
     'halal-tour', TRUE, 5, 1),

    ('Apakah SS Umroh melayani program umroh untuk perusahaan?',
     'Ya. Kami memiliki program Umroh Korporat yang dirancang khusus untuk perusahaan, instansi pemerintah, dan komunitas. Minimum 10 peserta, dengan koordinator khusus dan harga group yang kompetitif.',
     'korporat', TRUE, 1, 1),

    ('Berapa minimum peserta untuk program korporat?',
     'Program korporat SS Umroh tersedia mulai dari 10 peserta. Semakin banyak peserta, semakin kompetitif harga yang bisa kami tawarkan.',
     'korporat', TRUE, 2, 1);


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: gallery_items
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO gallery_items
    (image_url, alt_text, caption, category, is_active, display_order, created_by)
VALUES
    ('https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80',
     'Blue Mosque Istanbul', 'Masjid Biru Istanbul — ikon Turki dalam paket Halal Tour', 'halal-tour', TRUE, 1, 1),

    ('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
     'Burj Khalifa Dubai', 'Malam di Dubai bersama rombongan SS Umroh', 'halal-tour', TRUE, 2, 1),

    ('https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80',
     'Fushimi Inari Kyoto', 'Eksplorasi kuil Fushimi Inari — Halal Tour Jepang 2025', 'halal-tour', TRUE, 3, 1),

    ('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&q=80',
     'Masjidil Haram Mekkah', 'Jamaah SS Umroh di Masjidil Haram', 'umroh', TRUE, 1, 1),

    ('https://images.unsplash.com/photo-1523151164408-6540213bd2c8?auto=format&fit=crop&w=600&q=80',
     'Masjid Nabawi Madinah', 'Suasana Masjid Nabawi saat keberangkatan SS Umroh', 'umroh', TRUE, 2, 1),

    ('https://images.unsplash.com/photo-1596401057633-54a8c8e30b0b?auto=format&fit=crop&w=600&q=80',
     'Registan Samarkand', 'Kompleks Registan — Halal Tour Uzbekistan Islamic Heritage', 'halal-tour', TRUE, 4, 1),

    ('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
     'Team Building Korporat', 'Program umroh korporat bersama SS Umroh — 120 peserta', 'korporat', TRUE, 1, 1),

    ('https://images.unsplash.com/photo-1489493887464-892be6d1daae?auto=format&fit=crop&w=600&q=80',
     'Medina Marrakech Maroko', 'Suasana Medina Marrakech dalam paket Halal Tour Maroko', 'halal-tour', TRUE, 5, 1),

    ('https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
     'Menara Eiffel Paris', 'Paris Halal Tour — SS Umroh Eropa Muslim Friendly 2025', 'halal-tour', TRUE, 6, 1);


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: team_members
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO team_members
    (full_name, role_title, department, photo_url, is_active, display_order, created_by)
VALUES
    ('H. Ahmad Sadaya', 'Founder & Direktur Utama', 'Management', NULL, TRUE, 1, 1),
    ('Bayu Muharram', 'Customer Service Manager', 'Customer Service', NULL, TRUE, 2, 1),
    ('Sari Rahayu', 'Marketing Manager', 'Marketing', NULL, TRUE, 3, 1),
    ('Ustadz Fauzi Al-Amin', 'Pembimbing Ibadah Senior', 'Operations', NULL, TRUE, 4, 1),
    ('Dian Permata', 'Koordinator Operasional', 'Operations', NULL, TRUE, 5, 1),
    ('Rini Fitriani', 'Tour Leader Halal Tour', 'Operations', NULL, TRUE, 6, 1);


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: contact_leads (sample)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO contact_leads
    (full_name, phone, email, subject, message, page_source, status)
VALUES
    ('Budi Santoso', '081234567890', 'budi@gmail.com',
     'Tanya paket umroh bintang 4',
     'Halo, saya tertarik dengan paket umroh bintang 4. Apakah ada slot untuk bulan Oktober 2025 untuk 2 orang (suami istri)?',
     'paket-umroh', 'new'),

    ('Ibu Hartini', '085678901234', NULL,
     'Tabungan umroh untuk anak saya',
     'Saya ingin tanya tentang tabungan umroh untuk keberangkatan 2026. Apakah bisa cicil Rp 500ribu/bulan?',
     'homepage', 'responded'),

    ('Pak Rizal', '087890123456', 'rizal@perusahaan.co.id',
     'Umroh ramadhan 2026',
     'Apakah sudah ada jadwal umroh Ramadhan 2026? Kami ada 4 orang yang ingin berangkat.',
     'paket-umroh', 'read');


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: corporate_inquiries (sample)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO corporate_inquiries
    (company_name, contact_person, phone, email, estimated_pax,
     travel_type, preferred_date, notes, status)
VALUES
    ('PT. Maju Bersama', 'Hendra Kusuma', '0811-222-3333', 'hendra@majubersama.co.id',
     45, 'umroh', '2025-11-01',
     'Program reward karyawan teladan. Budget per orang sekitar 35 juta. Mohon kirimkan proposal.',
     'responded'),

    ('Yayasan Pendidikan Islam Nusantara', 'Ustadz Mahmud', '0822-444-5555', NULL,
     25, 'umroh', '2026-01-15',
     'Keberangkatan guru-guru pesantren. Butuh pembimbing khusus dan manasik intensif.',
     'new'),

    ('Bank Syariah Mandiri — Cabang Bandung', 'Ibu Lestari', '0833-666-7777', 'lestari@bsm.co.id',
     120, 'both', '2025-12-20',
     'Event tahunan perusahaan. Sebagian umroh, sebagian halal tour. Mohon proposal terpisah.',
     'quoted');
```

---

## 5. Index Strategy Summary

### High-Traffic Query Patterns (Public Website)

| Query | Index |
|-------|-------|
| Fetch active packages ordered by display | `idx_packages_display_order` (partial: active + not deleted) |
| Fetch featured package | `idx_packages_one_featured` (unique partial) |
| Upcoming departures for a package | `idx_departures_package_date` (composite + partial) |
| Low-seat departures alert | `idx_departures_low_seats` (partial: ≤5 seats + upcoming) |
| Active halal destinations by order | `idx_halal_dest_active` |
| Active halal packages by departure | `idx_halal_pkgs_departure` |
| Testimonials by page context | `idx_testimonials_public` (composite + partial: verified + active) |
| FAQs by category | `idx_faqs_public` (composite + partial: active) |
| Gallery by category | `idx_gallery_public` (composite + partial: active) |

### Admin / CMS Query Patterns

| Query | Index |
|-------|-------|
| Lead inbox (new leads first) | `idx_leads_inbox` (status + created_at DESC) |
| Leads assigned to CS agent | `idx_leads_assigned` (assigned_to + status) |
| Audit log by entity | `idx_audit_entity` (entity_type + entity_id + created_at) |
| Search leads by phone | `idx_leads_phone` |
| Fuzzy search packages/FAQs | GIN trigram indexes (`pg_trgm`) |
| Pending (unverified) testimonials | `idx_testimonials_pending` |

---

## 6. Notes on Design Decisions

**Why BIGSERIAL instead of UUID?**  
- Better B-tree index performance on high-traffic FK joins
- Natural sort order by insertion time (useful for leads inbox ordering)
- Simpler debugging — IDs are human-readable in logs and URLs
- UUID can be added as a separate `public_id` column later if URL obfuscation is needed

**Why VARCHAR CHECK instead of ENUM?**  
- Adding a new enum value in PostgreSQL requires `ALTER TYPE ... ADD VALUE` which is transactional-safe but irreversible (cannot remove values without a full type rebuild)
- VARCHAR + CHECK constraints are trivially altered with `ALTER TABLE ... DROP CONSTRAINT / ADD CONSTRAINT`
- No performance difference on a small cardinality domain (role, status, category)

**Why soft-delete on content tables but not on leads?**  
- Content (packages, FAQs, testimonials) needs recovery from accidental deletes; soft-delete provides a safety net
- Leads are compliance records — they should never be deleted (retention policy); they are closed, not removed

**Why RESTRICT on operational FKs?**  
- `departure_schedules.package_id → packages` uses RESTRICT to prevent deleting a package that has historical departure records, preserving data integrity and audit trails
- Same for `halal_packages.destination_id → halal_destinations`
