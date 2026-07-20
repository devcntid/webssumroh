# Technical Requirements Document — SS Umroh Platform

**Version:** 1.0  
**Date:** July 2025  
**Scope:** Public Website + Admin Panel (CMS)  
**Status:** Approved for Implementation

---

## 1. Platform Overview

Two applications sharing one Next.js monorepo, one Neon PostgreSQL database, and one Vercel deployment:

| App | Path Prefix | Audience | Rendering |
|-----|-------------|----------|-----------|
| Public Website | `/` | Prospective jamaah & corporate clients | SSR + ISR |
| Admin Panel | `/admin` | Internal staff (super_admin, admin, editor, cs_agent) | SSR + Client components |

**All React components in the original SPA (`ss_umroh_app.tsx`) are reference material only.** Every component, layout, and page must be re-implemented as a Next.js SSR-first page. No output from the reference file is shipped as-is.

---

## 2. Core Technology Decisions

### 2.1 Framework — Next.js 15 (App Router)
- **Runtime:** Node.js 20 LTS
- **Rendering strategy:**
  - Public pages: SSR by default; ISR (`revalidate`) for high-read, low-write sections (packages, FAQ, destinations)
  - Admin pages: SSR for initial load, React Client Components for interactive CRUD forms
- **Why not SPA:** SEO is a primary acquisition channel. Every public page must render full HTML on the server so crawlers index package names, destinations, and FAQ answers without JavaScript execution.
- **Route Groups:**
  - `(public)` — public website routes
  - `(admin)` — admin panel routes, all protected by middleware

### 2.2 Database — Neon PostgreSQL (Serverless)
- **Driver:** `@neondatabase/serverless` — HTTP-based, works in Vercel Edge and serverless functions without connection pool exhaustion
- **Query style:** 100% raw SQL strings. No ORM query builder, no query chaining, no model classes, no Prisma, no Drizzle query API.
- **Connection:** Single pooled client exported from `lib/db.ts`. All query functions import from this module.
- **Schema source of truth:** The DDL in `erd.md`. Drizzle generates migration files from a matching schema definition but is never called at runtime.

### 2.3 Drizzle — Migration & Seed Only
- `drizzle-orm` and `drizzle-kit` are `devDependencies`.
- `drizzle-kit` reads `drizzle/schema.ts` (mirrors `erd.md` DDL) and generates migration SQL files into `drizzle/migrations/`.
- `drizzle-kit migrate` applies migrations against Neon.
- Seeds are written as plain SQL files in `drizzle/seeds/` and run via a `scripts/seed.ts` Node script. Seeds are idempotent (`INSERT ... ON CONFLICT DO NOTHING`).
- **Drizzle is never imported in `app/`, `lib/queries/`, or any component file.**

### 2.4 Caching — Upstash Redis
- **Client:** `@upstash/redis` (REST-based, works in Vercel serverless)
- **Use cases:**

| Cache Key Pattern | TTL | Purpose |
|---|---|---|
| `packages:active` | 5 min | Active Umroh packages list |
| `packages:featured` | 5 min | Single featured package |
| `departures:pkg:{id}` | 2 min | Departure schedules per package |
| `halal_dest:active` | 10 min | All active Halal destinations |
| `halal_pkgs:active` | 5 min | All active Halal packages |
| `faq:{category}` | 15 min | FAQ list per category |
| `testimonials:{context}` | 10 min | Testimonials per page context |
| `gallery:{category}` | 10 min | Gallery per category |
| `site_settings` | 30 min | Site-wide settings singleton |
| `rate:login:{ip}` | 15 min | Login attempt counter per IP |
| `rate:contact:{ip}` | 1 min | Contact form submission rate limit |
| `session:{token}` | 8 hr | Admin session store |

- **Cache invalidation:** On every CMS write (POST/PUT/DELETE in admin API routes), the relevant cache key(s) are deleted via `redis.del(...)` before returning the response.
- **No stale cache on writes:** Write-through invalidation, not write-through population. Let the next read repopulate.

### 2.5 File & Image Storage — Vercel Blob
- **Client:** `@vercel/blob`
- All image uploads from the admin panel go directly to Vercel Blob via server-side API route — the browser never gets a signed URL to upload directly (security).
- Returned blob URL is stored in the relevant DB column (`cover_image_url`, `photo_url`, etc.).
- **Accepted types:** `image/jpeg`, `image/png`, `image/webp` — max 8MB enforced server-side.
- **Naming convention:** `/{entity}/{timestamp}-{random}.{ext}` — e.g. `/packages/1720000000000-a3f9.webp`
- Images served via Vercel's global CDN (blob URLs are CDN-fronted by default).
- `next/image` is used for all image rendering on the public site with `sizes` and `priority` props set correctly.

### 2.6 Payment — Xendit
- **Client:** `xendit-node`
- **Use cases (v1):** Tabungan Umroh (savings installment) — create invoice, receive webhook, update payment status.
- Webhook endpoint: `app/api/webhooks/xendit/route.ts` — validates `x-callback-token` header before processing.
- Payment records stored in `payments` table (see ERD addendum).
- **No payment UI on public site in v1** beyond a redirect to Xendit-hosted invoice page.

### 2.7 Rich Text — Tiptap
- Used in the admin panel for FAQ answer editing and package description editing.
- Extensions: `StarterKit`, `Link`, `Underline` — no image embedding inside rich text (images go through gallery).
- Output format: HTML string stored in the `answer` / `description` column.
- Rendered on public site via `dangerouslySetInnerHTML` with a server-side DOMPurify sanitization pass (`isomorphic-dompurify`) before render.

### 2.8 Drag-and-Drop — dnd-kit
- Used in admin panel for reordering: packages, FAQ items, gallery grid, halal destinations, team members, testimonials.
- `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
- On drag end: optimistic UI update local state immediately, then fire `PATCH /api/{model}/reorder` with new order array.
- On API error: revert to previous order with toast notification.

### 2.9 Data Visualization — Recharts
- Used in admin dashboard: leads by day (line chart), package inquiry breakdown (pie chart), seat availability (bar chart).
- All chart data fetched server-side and passed as props to Client Components — charts render client-side only (wrapped in `dynamic(() => ..., { ssr: false })`).

### 2.10 Export — xlsx & pdf
- `xlsx` (SheetJS): CSV/Excel export of leads and corporate inquiries from admin panel.
- `pdf-lib` or `@react-pdf/renderer`: generate departure confirmation sheets and quotation PDFs.
- Both operations happen in API routes (`/api/admin/leads/export`) and stream the file as a response with correct `Content-Disposition` headers.

---

## 3. Project Structure

```
ss-umroh/
├── app/
│   ├── (public)/                    # Public website route group
│   │   ├── layout.tsx               # Public layout: Nav + Footer + WA float
│   │   ├── page.tsx                 # Homepage (SSR)
│   │   ├── paket-umroh/
│   │   │   └── page.tsx
│   │   ├── halal-tour/
│   │   │   └── page.tsx
│   │   ├── korporat/
│   │   │   └── page.tsx
│   │   ├── tentang-kami/
│   │   │   └── page.tsx
│   │   ├── destinasi/
│   │   │   └── page.tsx
│   │   └── kontak/
│   │       └── page.tsx
│   │
│   ├── (admin)/                     # Admin panel route group
│   │   ├── layout.tsx               # Admin layout: Sidebar + Topbar
│   │   ├── admin/
│   │   │   ├── page.tsx             # Dashboard
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── site-settings/
│   │   │   │   └── page.tsx
│   │   │   ├── packages/
│   │   │   │   ├── page.tsx         # Package list
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx    # Edit
│   │   │   ├── schedules/
│   │   │   │   └── page.tsx
│   │   │   ├── halal-destinations/
│   │   │   │   └── page.tsx
│   │   │   ├── halal-packages/
│   │   │   │   └── page.tsx
│   │   │   ├── testimonials/
│   │   │   │   └── page.tsx
│   │   │   ├── faqs/
│   │   │   │   └── page.tsx
│   │   │   ├── gallery/
│   │   │   │   └── page.tsx
│   │   │   ├── team/
│   │   │   │   └── page.tsx
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── corporate-inquiries/
│   │   │   │   └── page.tsx
│   │   │   └── users/
│   │   │       └── page.tsx         # super_admin only
│   │
│   └── api/                         # API Route Handlers
│       ├── packages/
│       │   └── route.ts             # GET (public), POST (admin)
│       ├── packages/[id]/
│       │   └── route.ts             # GET, PUT, DELETE
│       ├── packages/reorder/
│       │   └── route.ts             # PATCH
│       ├── schedules/
│       │   └── route.ts
│       ├── schedules/[id]/
│       │   └── route.ts
│       ├── halal-destinations/
│       │   └── route.ts
│       ├── halal-destinations/[id]/
│       │   └── route.ts
│       ├── halal-packages/
│       │   └── route.ts
│       ├── halal-packages/[id]/
│       │   └── route.ts
│       ├── testimonials/
│       │   └── route.ts
│       ├── testimonials/[id]/
│       │   └── route.ts
│       ├── faqs/
│       │   └── route.ts
│       ├── faqs/[id]/
│       │   └── route.ts
│       ├── gallery/
│       │   └── route.ts
│       ├── gallery/[id]/
│       │   └── route.ts
│       ├── gallery/upload/
│       │   └── route.ts             # Vercel Blob upload handler
│       ├── team/
│       │   └── route.ts
│       ├── team/[id]/
│       │   └── route.ts
│       ├── site-settings/
│       │   └── route.ts
│       ├── leads/
│       │   └── route.ts             # POST (public contact form)
│       ├── leads/[id]/
│       │   └── route.ts
│       ├── leads/export/
│       │   └── route.ts             # GET → stream XLSX
│       ├── corporate-inquiries/
│       │   └── route.ts
│       ├── corporate-inquiries/[id]/
│       │   └── route.ts
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       ├── admin/users/
│       │   └── route.ts
│       ├── admin/users/[id]/
│       │   └── route.ts
│       ├── admin/audit-logs/
│       │   └── route.ts
│       ├── admin/dashboard/
│       │   └── route.ts             # Dashboard stats aggregate
│       └── webhooks/
│           └── xendit/route.ts
│
├── lib/
│   ├── db.ts                        # Neon client singleton
│   ├── redis.ts                     # Upstash Redis client singleton
│   ├── auth.ts                      # JWT sign/verify, session helpers
│   ├── blob.ts                      # Vercel Blob upload helpers
│   ├── xendit.ts                    # Xendit client init
│   ├── sanitize.ts                  # DOMPurify server-side wrapper
│   ├── cache.ts                     # Cache key constants + invalidation helpers
│   ├── rate-limit.ts                # Upstash Redis-backed rate limiter
│   └── queries/                     # ← ALL raw SQL lives here
│       ├── packages.ts
│       ├── schedules.ts
│       ├── halal-destinations.ts
│       ├── halal-packages.ts
│       ├── testimonials.ts
│       ├── faqs.ts
│       ├── gallery.ts
│       ├── team.ts
│       ├── site-settings.ts
│       ├── leads.ts
│       ├── corporate-inquiries.ts
│       ├── admin-users.ts
│       ├── audit-logs.ts
│       └── dashboard.ts
│
├── components/
│   ├── public/                      # Public website components
│   │   ├── layout/
│   │   │   ├── Nav.tsx
│   │   │   ├── MegaMenu.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── WhatsAppFloat.tsx
│   │   │   └── MobileBottomBar.tsx
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── PackageCard.tsx
│   │   │   ├── PackageGrid.tsx
│   │   │   ├── DepartureSchedule.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── FAQSection.tsx
│   │   │   ├── CTABanner.tsx
│   │   │   ├── TrustStrip.tsx
│   │   │   ├── GalleryGrid.tsx
│   │   │   ├── DestinationCard.tsx
│   │   │   ├── HalalPackageCard.tsx
│   │   │   ├── TeamGrid.tsx
│   │   │   └── StatsStrip.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Breadcrumb.tsx
│   │       ├── AccordionItem.tsx
│   │       └── StarRating.tsx
│   │
│   ├── admin/                       # Admin panel components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── AdminLayout.tsx
│   │   ├── forms/
│   │   │   ├── PackageForm.tsx
│   │   │   ├── ScheduleForm.tsx
│   │   │   ├── TestimonialForm.tsx
│   │   │   ├── FAQForm.tsx
│   │   │   ├── HalalDestinationForm.tsx
│   │   │   ├── HalalPackageForm.tsx
│   │   │   ├── TeamMemberForm.tsx
│   │   │   ├── SiteSettingsForm.tsx
│   │   │   └── GalleryUploadForm.tsx
│   │   ├── tables/
│   │   │   ├── PackageTable.tsx
│   │   │   ├── ScheduleTable.tsx
│   │   │   ├── LeadsTable.tsx
│   │   │   ├── TestimonialTable.tsx
│   │   │   └── AuditLogTable.tsx
│   │   ├── dnd/
│   │   │   └── SortableList.tsx     # Generic dnd-kit sortable wrapper
│   │   ├── charts/
│   │   │   ├── LeadsChart.tsx       # Recharts line chart
│   │   │   ├── PackagePieChart.tsx
│   │   │   └── SeatsBarChart.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Toggle.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       ├── Pagination.tsx
│   │       ├── Badge.tsx
│   │       ├── ImageUpload.tsx
│   │       ├── RichTextEditor.tsx   # Tiptap wrapper
│   │       ├── ConfirmDialog.tsx
│   │       └── EmptyState.tsx
│   │
│   └── shared/                      # Shared between public and admin
│       ├── MetaTags.tsx
│       └── LoadingSpinner.tsx
│
├── middleware.ts                    # Auth guard for /admin routes
├── drizzle/
│   ├── schema.ts                    # Mirror of erd.md (for drizzle-kit only)
│   ├── migrations/                  # Auto-generated by drizzle-kit
│   └── seeds/
│       ├── 001_site_settings.sql
│       ├── 002_admin_users.sql
│       ├── 003_packages.sql
│       ├── 004_schedules.sql
│       ├── 005_halal_destinations.sql
│       ├── 006_halal_packages.sql
│       ├── 007_testimonials.sql
│       ├── 008_faqs.sql
│       ├── 009_gallery.sql
│       └── 010_team.sql
├── scripts/
│   ├── seed.ts                      # Runs all seed SQL files sequentially
│   └── migrate.ts                   # Wrapper around drizzle-kit migrate
├── types/
│   ├── db.ts                        # TypeScript interfaces matching DB rows
│   ├── api.ts                       # Request/response body types
│   └── auth.ts                      # Session, JWT payload types
├── public/
│   └── assets/                      # Static brand assets (logo SVG, favicon)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Data Layer — Raw Query Rules

### 4.1 The Single Rule
**Raw SQL is written exclusively in `lib/queries/{model}.ts`.** No SQL string may appear in:
- Any file under `app/`
- Any component under `components/`
- `lib/auth.ts`, `lib/cache.ts`, or any other lib file except query files

### 4.2 `lib/db.ts` — Database Client

```typescript
// lib/db.ts
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = neon(process.env.DATABASE_URL);
```

### 4.3 Query File Pattern — `lib/queries/{model}.ts`

Each query file exports typed async functions. Every function:
- Takes typed parameters
- Returns typed results or throws a typed error
- Uses parameterized queries exclusively (never string interpolation for user input)
- Handles `deleted_at IS NULL` filter internally — callers never repeat this

```typescript
// lib/queries/packages.ts
import { sql } from "@/lib/db";
import type { Package, PackageRow } from "@/types/db";

export async function getActivePackages(): Promise<Package[]> {
  const rows = await sql`
    SELECT
      id, slug, name, category, tag_line, description,
      hotel_distance_m, flight_type, price_mode,
      price_idr, price_display_text, cover_image_url,
      is_featured, is_active, display_order
    FROM packages
    WHERE deleted_at IS NULL
      AND is_active = TRUE
    ORDER BY display_order ASC
  `;
  return rows as Package[];
}

export async function getFeaturedPackage(): Promise<Package | null> {
  const rows = await sql`
    SELECT *
    FROM packages
    WHERE deleted_at IS NULL
      AND is_active = TRUE
      AND is_featured = TRUE
    LIMIT 1
  `;
  return (rows[0] as Package) ?? null;
}

export async function getPackageById(id: number): Promise<Package | null> {
  const rows = await sql`
    SELECT * FROM packages
    WHERE id = ${id} AND deleted_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as Package) ?? null;
}

export async function createPackage(
  data: Omit<Package, "id" | "created_at" | "updated_at" | "deleted_at">,
  adminUserId: number
): Promise<Package> {
  const rows = await sql`
    INSERT INTO packages (
      slug, name, category, tag_line, description,
      hotel_distance_m, flight_type, price_mode,
      price_idr, price_display_text, cover_image_url,
      is_featured, is_active, display_order, created_by, updated_by
    ) VALUES (
      ${data.slug}, ${data.name}, ${data.category}, ${data.tag_line},
      ${data.description}, ${data.hotel_distance_m}, ${data.flight_type},
      ${data.price_mode}, ${data.price_idr}, ${data.price_display_text},
      ${data.cover_image_url}, ${data.is_featured}, ${data.is_active},
      ${data.display_order}, ${adminUserId}, ${adminUserId}
    )
    RETURNING *
  `;
  return rows[0] as Package;
}

export async function updatePackage(
  id: number,
  data: Partial<Omit<Package, "id" | "created_at" | "updated_at" | "deleted_at">>,
  adminUserId: number
): Promise<Package | null> {
  const rows = await sql`
    UPDATE packages SET
      name           = COALESCE(${data.name ?? null}, name),
      tag_line       = COALESCE(${data.tag_line ?? null}, tag_line),
      description    = COALESCE(${data.description ?? null}, description),
      price_mode     = COALESCE(${data.price_mode ?? null}, price_mode),
      price_idr      = COALESCE(${data.price_idr ?? null}, price_idr),
      is_featured    = COALESCE(${data.is_featured ?? null}, is_featured),
      is_active      = COALESCE(${data.is_active ?? null}, is_active),
      cover_image_url= COALESCE(${data.cover_image_url ?? null}, cover_image_url),
      updated_by     = ${adminUserId},
      updated_at     = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING *
  `;
  return (rows[0] as Package) ?? null;
}

export async function softDeletePackage(id: number): Promise<boolean> {
  // Block if active departures reference this package
  const deps = await sql`
    SELECT COUNT(*) AS cnt FROM departure_schedules
    WHERE package_id = ${id} AND deleted_at IS NULL AND status = 'upcoming'
  `;
  if (Number(deps[0].cnt) > 0) {
    throw new Error("PACKAGE_HAS_ACTIVE_DEPARTURES");
  }
  const rows = await sql`
    UPDATE packages SET deleted_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING id
  `;
  return rows.length > 0;
}

export async function reorderPackages(
  orderedIds: number[]
): Promise<void> {
  // Use unnest to batch-update display_order in one query
  const positions = orderedIds.map((id, idx) => ({ id, pos: idx + 1 }));
  await sql`
    UPDATE packages AS p SET
      display_order = v.pos,
      updated_at    = NOW()
    FROM (
      SELECT
        UNNEST(${positions.map(p => p.id)}::bigint[]) AS id,
        UNNEST(${positions.map(p => p.pos)}::int[])   AS pos
    ) AS v
    WHERE p.id = v.id AND p.deleted_at IS NULL
  `;
}
```

### 4.4 API Route Pattern — `app/api/{model}/route.ts`

API routes contain:
- Input validation (Zod schema parse)
- Auth check (read session from Upstash Redis)
- Call to query function(s)
- Cache invalidation if write operation
- Audit log write
- Return `NextResponse.json()`

API routes contain **no SQL**. They orchestrate: validate → auth → query → cache → respond.

```typescript
// app/api/packages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getActivePackages, createPackage } from "@/lib/queries/packages";
import { getCached, setCached, invalidate } from "@/lib/cache";
import { requireAuth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import { CACHE_KEYS } from "@/lib/cache";

// GET — public, cached
export async function GET() {
  const cached = await getCached(CACHE_KEYS.PACKAGES_ACTIVE);
  if (cached) {
    return NextResponse.json(cached);
  }

  const packages = await getActivePackages();
  await setCached(CACHE_KEYS.PACKAGES_ACTIVE, packages, 300); // 5 min TTL
  return NextResponse.json(packages);
}

const CreatePackageSchema = z.object({
  slug:              z.string().min(2).max(80),
  name:              z.string().min(2).max(120),
  category:          z.enum(["hemat","bintang4","tabungan","ramadhan","group"]),
  tag_line:          z.string().max(60).optional(),
  description:       z.string().optional(),
  hotel_distance_m:  z.number().int().min(0).max(5000).optional(),
  flight_type:       z.string().max(60).default("Direct ✈"),
  price_mode:        z.enum(["contact","number"]).default("contact"),
  price_idr:         z.number().int().positive().optional(),
  price_display_text:z.string().max(60).optional(),
  cover_image_url:   z.string().url().optional(),
  is_featured:       z.boolean().default(false),
  is_active:         z.boolean().default(true),
  display_order:     z.number().int().default(0),
});

// POST — admin only
export async function POST(req: NextRequest) {
  const session = await requireAuth(req, ["super_admin", "admin", "editor"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreatePackageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const pkg = await createPackage(parsed.data, session.userId);

  await invalidate(CACHE_KEYS.PACKAGES_ACTIVE);
  await invalidate(CACHE_KEYS.PACKAGES_FEATURED);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "created",
    entity_type: "packages",
    entity_id: pkg.id,
    changed_fields: parsed.data,
  });

  return NextResponse.json(pkg, { status: 201 });
}
```

---

## 5. Authentication & Session

### 5.1 Flow
1. `POST /api/auth/login` — validates credentials against `admin_users` table (bcrypt compare)
2. On success: generate JWT (payload: `{ userId, role, email }`), store session in Upstash Redis key `session:{token}` with 8hr TTL
3. Set httpOnly cookie `ss_admin_token` with `SameSite=Strict; Secure; Path=/admin`
4. `middleware.ts` reads cookie, verifies JWT signature, checks Redis session key exists
5. If session missing or JWT invalid → redirect to `/admin/login`
6. `POST /api/auth/logout` — deletes Redis session key + clears cookie

### 5.2 Rate Limiting on Login
```typescript
// lib/rate-limit.ts
import { redis } from "@/lib/redis";

export async function checkLoginRateLimit(ip: string): Promise<boolean> {
  const key = `rate:login:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 900); // 15 min window
  return count <= 5;
}
```

### 5.3 Role Guard Helper
```typescript
// lib/auth.ts
export async function requireAuth(
  req: NextRequest,
  allowedRoles: string[]
): Promise<{ userId: number; role: string; email: string } | null> {
  const token = req.cookies.get("ss_admin_token")?.value;
  if (!token) return null;
  // verify JWT, check Redis, check role
  ...
}
```

---

## 6. Rendering Strategy Per Page

| Route | Strategy | Revalidate | Data sources |
|-------|----------|------------|-------------|
| `/` (Homepage) | SSR + ISR | 300s | packages, testimonials, faqs, site_settings (all via Redis cache) |
| `/paket-umroh` | SSR + ISR | 120s | packages, schedules, testimonials, faqs |
| `/halal-tour` | SSR + ISR | 300s | halal_destinations, halal_packages, testimonials, faqs |
| `/korporat` | SSR + ISR | 600s | testimonials (korporat), faqs (korporat) |
| `/tentang-kami` | SSR + ISR | 3600s | team_members |
| `/destinasi` | SSR | no ISR (static editorial) | site_settings only |
| `/kontak` | SSR | no ISR | site_settings |
| `/admin/*` | SSR (no ISR) | — | Direct DB queries (no public cache) |

ISR `revalidate` is set at the `page.tsx` level via `export const revalidate = N`.

---

## 7. SSR Data Fetching Pattern

Server Components fetch data by importing query functions directly. No `fetch()` calls to own API routes from server components — that adds unnecessary HTTP round-trips.

```typescript
// app/(public)/page.tsx
import { getActivePackages, getFeaturedPackage } from "@/lib/queries/packages";
import { getTestimonials } from "@/lib/queries/testimonials";
import { getFaqs } from "@/lib/queries/faqs";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getCached, setCached, CACHE_KEYS } from "@/lib/cache";

export const revalidate = 300;

export default async function HomePage() {
  // Serve from Redis cache if warm; otherwise query DB and populate cache
  const [packages, testimonials, faqs, settings] = await Promise.all([
    getCachedOrFetch(CACHE_KEYS.PACKAGES_ACTIVE, getActivePackages, 300),
    getCachedOrFetch(CACHE_KEYS.TESTIMONIALS_GENERAL, () => getTestimonials("general"), 600),
    getCachedOrFetch(CACHE_KEYS.FAQ_GENERAL, () => getFaqs("general"), 900),
    getCachedOrFetch(CACHE_KEYS.SITE_SETTINGS, getSiteSettings, 1800),
  ]);

  return (
    <>
      <HeroSection settings={settings} />
      <PackageGrid packages={packages} />
      <TestimonialsSection items={testimonials} />
      <FAQSection items={faqs} />
    </>
  );
}
```

---

## 8. Cache Helpers — `lib/cache.ts`

```typescript
// lib/cache.ts
import { redis } from "@/lib/redis";

export const CACHE_KEYS = {
  PACKAGES_ACTIVE:          "packages:active",
  PACKAGES_FEATURED:        "packages:featured",
  HALAL_DEST_ACTIVE:        "halal_dest:active",
  HALAL_PKGS_ACTIVE:        "halal_pkgs:active",
  FAQ_GENERAL:              "faq:general",
  FAQ_HALAL_TOUR:           "faq:halal-tour",
  FAQ_KORPORAT:             "faq:korporat",
  TESTIMONIALS_GENERAL:     "testimonials:general",
  TESTIMONIALS_HALAL:       "testimonials:halal-tour",
  TESTIMONIALS_KORPORAT:    "testimonials:korporat",
  GALLERY_UMROH:            "gallery:umroh",
  GALLERY_HALAL:            "gallery:halal-tour",
  SITE_SETTINGS:            "site_settings",
  DEPARTURES_PKG: (id: number) => `departures:pkg:${id}`,
} as const;

export async function getCached<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  if (!raw) return null;
  return (typeof raw === "string" ? JSON.parse(raw) : raw) as T;
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function invalidate(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await redis.del(...keys);
}

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached !== null) return cached;
  const fresh = await fetcher();
  await setCached(key, fresh, ttlSeconds);
  return fresh;
}
```

---

## 9. Image Upload — Vercel Blob

```typescript
// app/api/gallery/upload/route.ts
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createGalleryItem } from "@/lib/queries/gallery";
import { invalidate, CACHE_KEYS } from "@/lib/cache";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const session = await requireAuth(req, ["super_admin", "admin", "editor"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const category = formData.get("category") as string;
  const altText  = formData.get("alt_text") as string;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  if (file.size > MAX_SIZE_BYTES)
    return NextResponse.json({ error: "File exceeds 8MB limit" }, { status: 413 });

  const ext      = file.name.split(".").pop();
  const blobName = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const blob     = await put(blobName, file, { access: "public" });

  const item = await createGalleryItem({
    image_url:   blob.url,
    alt_text:    altText,
    category:    category as any,
    is_active:   true,
    display_order: 0,
  }, session.userId);

  await invalidate(CACHE_KEYS.GALLERY_UMROH, CACHE_KEYS.GALLERY_HALAL);

  return NextResponse.json(item, { status: 201 });
}
```

---

## 10. Export — XLSX & PDF

### 10.1 XLSX Lead Export
```typescript
// app/api/leads/export/route.ts
import * as XLSX from "xlsx";
import { getAllLeads } from "@/lib/queries/leads";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, ["super_admin", "admin", "cs_agent"]);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const leads = await getAllLeads();
  const ws = XLSX.utils.json_to_sheet(leads);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="leads-${Date.now()}.xlsx"`,
    },
  });
}
```

---

## 11. Xendit Payment Integration

### 11.1 Create Invoice
```typescript
// lib/queries/payments.ts
// stores payment records — raw SQL only

// app/api/payments/create-invoice/route.ts
import { Xendit } from "xendit-node";
import { createPaymentRecord } from "@/lib/queries/payments";

const xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY! });

export async function POST(req: NextRequest) {
  const body = await req.json();
  // validate body ...
  const invoice = await xendit.Invoice.createInvoice({
    externalID:  `ssumroh-${Date.now()}`,
    amount:       body.amount_idr,
    payerEmail:   body.email,
    description: `SS Umroh — ${body.package_name}`,
    currency:    "IDR",
    successRedirectURL: `${process.env.NEXT_PUBLIC_BASE_URL}/pembayaran/sukses`,
    failureRedirectURL: `${process.env.NEXT_PUBLIC_BASE_URL}/pembayaran/gagal`,
  });

  await createPaymentRecord({
    external_id:  invoice.external_id,
    invoice_url:  invoice.invoice_url,
    amount_idr:   body.amount_idr,
    status:       "pending",
    lead_id:      body.lead_id,
  });

  return NextResponse.json({ invoice_url: invoice.invoice_url });
}
```

### 11.2 Webhook Handler
```typescript
// app/api/webhooks/xendit/route.ts
export async function POST(req: NextRequest) {
  const callbackToken = req.headers.get("x-callback-token");
  if (callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
    return new Response("Forbidden", { status: 403 });
  }
  const event = await req.json();
  // update payment status in DB via lib/queries/payments.ts
  ...
  return new Response("OK", { status: 200 });
}
```

---

## 12. Middleware — Admin Route Protection

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { redis } from "@/lib/redis";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get("ss_admin_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));

  const payload = verifyJWT(token);
  if (!payload) return NextResponse.redirect(new URL("/admin/login", req.url));

  const sessionExists = await redis.exists(`session:${token}`);
  if (!sessionExists) return NextResponse.redirect(new URL("/admin/login", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
```

---

## 13. TypeScript Types — `types/db.ts`

```typescript
// types/db.ts
export interface Package {
  id:                 number;
  slug:               string;
  name:               string;
  category:           "hemat" | "bintang4" | "tabungan" | "ramadhan" | "group";
  tag_line:           string | null;
  description:        string | null;
  hotel_distance_m:   number | null;
  flight_type:        string | null;
  price_mode:         "contact" | "number";
  price_idr:          number | null;
  price_display_text: string | null;
  cover_image_url:    string | null;
  is_featured:        boolean;
  is_active:          boolean;
  display_order:      number;
  created_at:         string;
  updated_at:         string;
  deleted_at:         string | null;
  created_by:         number | null;
  updated_by:         number | null;
}

export interface DepartureSchedule {
  id:                 number;
  package_id:         number;
  departure_date:     string;
  return_date:        string;
  departure_city:     string;
  airline:            string | null;
  total_seats:        number;
  seats_remaining:    number;
  price_override_idr: number | null;
  status:             "upcoming" | "ongoing" | "completed" | "cancelled";
  internal_notes:     string | null;
  created_at:         string;
  updated_at:         string;
  deleted_at:         string | null;
}

export interface Testimonial {
  id:             number;
  full_name:      string;
  initials:       string;
  city_or_role:   string | null;
  package_name:   string | null;
  star_rating:    number;
  quote_text:     string;
  page_context:   "general" | "halal-tour" | "korporat";
  date_collected: string | null;
  is_verified:    boolean;
  is_active:      boolean;
  display_order:  number;
}

export interface FAQ {
  id:            number;
  question:      string;
  answer:        string;
  category:      "general" | "halal-tour" | "korporat";
  is_active:     boolean;
  display_order: number;
}

export interface HalalDestination {
  id:                  number;
  country_name:        string;
  flag_emoji:          string | null;
  badge_label:         string | null;
  description:         string | null;
  duration_text:       string | null;
  best_season:         string | null;
  starting_price_text: string | null;
  cover_image_url:     string | null;
  is_active:           boolean;
  display_order:       number;
}

export interface HalalPackage {
  id:                  number;
  destination_id:      number;
  name:                string;
  tag_line:            string | null;
  is_featured:         boolean;
  seats_remaining:     number | null;
  meta_chips:          string[];
  highlights_text:     string | null;
  price_display_text:  string | null;
  price_idr:           number | null;
  cover_image_url:     string | null;
  departure_month:     string | null;
  departure_date:      string | null;
  is_active:           boolean;
  display_order:       number;
}

export interface GalleryItem {
  id:            number;
  image_url:     string;
  thumbnail_url: string | null;
  alt_text:      string;
  caption:       string | null;
  category:      "umroh" | "halal-tour" | "korporat" | "general";
  is_active:     boolean;
  display_order: number;
}

export interface TeamMember {
  id:            number;
  full_name:     string;
  role_title:    string;
  department:    string;
  photo_url:     string | null;
  bio:           string | null;
  is_active:     boolean;
  display_order: number;
}

export interface SiteSettings {
  id:             number;
  phone_display:  string;
  whatsapp_number:string;
  office_address: string;
  cs_name:        string;
  ppiu_license:   string;
  maps_embed_url: string | null;
  updated_at:     string;
}

export interface ContactLead {
  id:          number;
  full_name:   string;
  phone:       string;
  email:       string | null;
  subject:     string | null;
  message:     string;
  page_source: string | null;
  status:      "new" | "read" | "responded" | "closed";
  agent_notes: string | null;
  assigned_to: number | null;
  created_at:  string;
  updated_at:  string;
}

export interface AdminUser {
  id:              number;
  full_name:       string;
  email:           string;
  role:            "super_admin" | "admin" | "editor" | "cs_agent";
  is_active:       boolean;
  last_login_at:   string | null;
}
```

---

## 14. Dependencies — `package.json`

```json
{
  "dependencies": {
    "next":                     "15.x",
    "react":                    "19.x",
    "react-dom":                "19.x",
    "@neondatabase/serverless":  "^0.10.x",
    "@upstash/redis":            "^1.34.x",
    "@vercel/blob":              "^0.27.x",
    "xendit-node":               "^6.x",
    "@tiptap/react":             "^2.x",
    "@tiptap/starter-kit":       "^2.x",
    "@tiptap/extension-link":    "^2.x",
    "@tiptap/extension-underline":"^2.x",
    "@dnd-kit/core":             "^6.x",
    "@dnd-kit/sortable":         "^8.x",
    "@dnd-kit/utilities":        "^3.x",
    "recharts":                  "^2.x",
    "xlsx":                      "^0.18.x",
    "pdf-lib":                   "^1.17.x",
    "isomorphic-dompurify":      "^2.x",
    "zod":                       "^3.x",
    "bcryptjs":                  "^2.x",
    "jsonwebtoken":              "^9.x",
    "date-fns":                  "^3.x"
  },
  "devDependencies": {
    "drizzle-orm":               "^0.33.x",
    "drizzle-kit":               "^0.24.x",
    "typescript":                "^5.x",
    "tailwindcss":               "^3.x",
    "@types/node":               "^20.x",
    "@types/react":              "^19.x",
    "@types/bcryptjs":           "^2.x",
    "@types/jsonwebtoken":       "^9.x",
    "tsx":                       "^4.x"
  }
}
```

---

## 15. Environment Variables

```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/ssumroh?sslmode=require"

# Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_xxx"

# Auth
JWT_SECRET="min-32-char-random-secret-here"

# Xendit
XENDIT_SECRET_KEY="xnd_production_xxx"
XENDIT_WEBHOOK_TOKEN="xxx"

# App
NEXT_PUBLIC_BASE_URL="https://ssumroh.id"
NEXT_PUBLIC_WA_NUMBER="6281312017883"
```

---

## 16. Performance Guidelines

| Concern | Solution |
|---------|---------|
| Cold start latency | Neon HTTP driver (no TCP handshake); Upstash REST (no connection pool warm-up) |
| Repeated DB reads | Upstash Redis cache with TTL per entity type |
| Image delivery | Vercel Blob CDN + `next/image` with `sizes` attribute |
| JavaScript bundle size | Server Components by default; Client Components only where interactivity is required; `dynamic()` for Recharts charts |
| ISR on high-read pages | `export const revalidate` set per page; Upstash cache as L1, ISR as L2 |
| Large list rendering | Pagination (25/page) on all admin tables; infinite scroll on gallery page |
| DB query efficiency | Partial indexes on active + not-deleted rows (see ERD); no SELECT * in queries — always explicit columns |
| Font loading | `next/font` with `display: swap`; Ubuntu + Inter loaded together, Amiri only where Arabic text appears |
| Admin dashboard charts | `dynamic(() => import(...), { ssr: false })` — charts never block SSR |

---

## 17. Vercel Deployment Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["sin1"],
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    },
    "app/api/webhooks/**": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options",        "value": "DENY" }
      ]
    }
  ]
}
```

- Region: `sin1` (Singapore) — closest to Indonesian users
- Blob storage is automatically global CDN via Vercel
- Environment variables set via Vercel dashboard (not committed)

---

## 18. What Is Explicitly Forbidden

| Practice | Why Forbidden |
|----------|--------------|
| Writing SQL in `app/` files or components | Breaks separation of concerns; untestable; coupling |
| Using Drizzle query builder at runtime | Drizzle is devDependency only; runtime bundle must stay clean |
| `fetch('/api/packages')` inside Server Components | Unnecessary HTTP round-trip; import query function directly |
| `SELECT *` in production queries | Forces column awareness; prevents breaking changes from schema additions leaking into code |
| String interpolation for user input in SQL | SQL injection vector; use tagged template literals from Neon driver only |
| Storing images in the DB (base64 or bytea) | Bloats DB; use Vercel Blob and store URL only |
| Storing session state in JWT payload only (no Redis) | Cannot invalidate tokens on logout without server-side session store |
| Client-side admin auth (localStorage tokens) | Stolen via XSS; use httpOnly cookies only |
