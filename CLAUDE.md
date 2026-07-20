# CLAUDE.md — SS Umroh Platform

> This file is the single source of truth for any AI agent working on this codebase.  
> Read this entire file before writing any code, creating any file, or making any decision.

---

## Project Identity

**Name:** SS Umroh — PT. Sarana Sadaya  
**Type:** Umrah travel agency (Indonesia) — public website + internal CMS/admin panel  
**Stack:** Next.js 15 (App Router) · Neon PostgreSQL · Upstash Redis · Vercel Blob · Xendit  
**Repo layout:** Monorepo — one Next.js app serving both public site (`/`) and admin panel (`/admin`)  
**Docs:**
- `prd-website.md` — public site scope and page specs
- `prd-admin.md` — admin panel module specs and roles
- `erd.md` — full PostgreSQL schema DDL and seed data
- `trd.md` — all technical decisions, architecture rules, code examples

---

## Non-Negotiable Architecture Rules

Read these before every task. Violating any rule means the output is wrong regardless of whether it compiles.

### Rule 1 — Raw SQL lives only in `lib/queries/`
```
✅ lib/queries/packages.ts     → contains SQL
✅ lib/queries/faqs.ts         → contains SQL
❌ app/api/packages/route.ts   → must NOT contain SQL
❌ components/PackageGrid.tsx  → must NOT contain SQL
❌ app/(public)/page.tsx       → must NOT contain SQL
```
Every query file exports typed async functions. API routes and Server Components call these functions, never write SQL themselves.

### Rule 2 — Drizzle is devDependency only, never imported at runtime
```
✅ drizzle/schema.ts           → only for drizzle-kit to read
✅ drizzle/migrations/         → generated SQL files, applied once
✅ scripts/seed.ts             → runs seed SQL files via node, never imported
❌ lib/queries/packages.ts     → must NOT import from drizzle-orm
❌ app/api/packages/route.ts   → must NOT import from drizzle-orm
```

### Rule 3 — Server Components fetch data by importing query functions, not via fetch()
```typescript
// ✅ CORRECT — Server Component imports query function directly
import { getActivePackages } from "@/lib/queries/packages";
const packages = await getActivePackages();

// ❌ WRONG — adds unnecessary HTTP round-trip to own server
const packages = await fetch("/api/packages").then(r => r.json());
```

### Rule 4 — Client Components are the exception, not the rule
Mark a component `"use client"` only when it needs:
- `useState` / `useReducer` / `useEffect`
- Browser event handlers (onClick that changes UI state)
- Third-party client-only libs (Recharts, dnd-kit, Tiptap)

Everything else stays as a Server Component.

### Rule 5 — No SQL string interpolation for user input
```typescript
// ✅ CORRECT — parameterized via Neon tagged template
await sql`SELECT * FROM packages WHERE id = ${id}`;

// ❌ WRONG — SQL injection vulnerability
await sql(`SELECT * FROM packages WHERE id = ${id}`);
await db.query(`SELECT * FROM packages WHERE id = ${id}`);
```

### Rule 6 — Always invalidate Redis cache after writes
Every `POST`, `PUT`, `PATCH`, `DELETE` in an API route must call `invalidate(CACHE_KEYS.*)` for the affected entity before returning the response.

### Rule 7 — Admin routes always call requireAuth first
```typescript
// First line of every admin API handler:
const session = await requireAuth(req, ["super_admin", "admin"]);
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

### Rule 8 — No SELECT * in query files
Always list columns explicitly. This prevents schema changes from silently leaking unexpected fields into API responses.

### Rule 9 — Soft delete, never hard delete on content tables
```typescript
// ✅ CORRECT
await sql`UPDATE packages SET deleted_at = NOW() WHERE id = ${id}`;

// ❌ WRONG
await sql`DELETE FROM packages WHERE id = ${id}`;
```
Exception: `contact_leads` and `corporate_inquiries` are never deleted (compliance).

### Rule 10 — Public website pages must render useful HTML without JavaScript
Every public page must be SSR. Package names, FAQ answers, destination descriptions, and testimonials must appear in the raw HTML response from the server.

---

## File Naming & Location Cheatsheet

| What you're creating | Where it goes |
|---------------------|--------------|
| Raw SQL query functions | `lib/queries/{model}.ts` |
| Neon DB client | `lib/db.ts` |
| Redis client | `lib/redis.ts` |
| Cache key constants + helpers | `lib/cache.ts` |
| Auth helpers (JWT, session) | `lib/auth.ts` |
| Blob upload helpers | `lib/blob.ts` |
| Rate limiting | `lib/rate-limit.ts` |
| TypeScript DB interfaces | `types/db.ts` |
| TypeScript API req/res types | `types/api.ts` |
| API route handler | `app/api/{model}/route.ts` |
| API route for single item | `app/api/{model}/[id]/route.ts` |
| Public page | `app/(public)/{slug}/page.tsx` |
| Admin page | `app/(admin)/admin/{module}/page.tsx` |
| Public reusable section | `components/public/sections/{Name}.tsx` |
| Public layout elements | `components/public/layout/{Name}.tsx` |
| Admin form | `components/admin/forms/{Model}Form.tsx` |
| Admin table | `components/admin/tables/{Model}Table.tsx` |
| Shared UI primitive | `components/admin/ui/{Name}.tsx` |
| Drizzle schema (devOnly) | `drizzle/schema.ts` |
| Seed SQL files | `drizzle/seeds/00N_{name}.sql` |
| Migration files (auto-gen) | `drizzle/migrations/` |

---

## Common Task Patterns

### Adding a new entity (e.g., `blog_posts`)

1. Add table DDL to `erd.md` and to `drizzle/schema.ts`
2. Run `drizzle-kit generate` to create migration file
3. Create `lib/queries/blog-posts.ts` with all CRUD functions
4. Add cache keys to `lib/cache.ts` (`CACHE_KEYS.BLOG_POSTS_ACTIVE`)
5. Create `app/api/blog-posts/route.ts` (GET + POST)
6. Create `app/api/blog-posts/[id]/route.ts` (GET + PUT + DELETE)
7. Create `app/(admin)/admin/blog-posts/page.tsx` and form component
8. Add TypeScript interface to `types/db.ts`
9. Add seed data to `drizzle/seeds/`

### Adding a new admin form field

1. Update the DB column in `erd.md` → `drizzle/schema.ts` → run migration
2. Update the query function in `lib/queries/{model}.ts` (add column to INSERT/UPDATE/SELECT)
3. Update TypeScript interface in `types/db.ts`
4. Update Zod validation schema in `app/api/{model}/route.ts`
5. Add input field to `components/admin/forms/{Model}Form.tsx`

### Adding a new public page section

1. Create Server Component in `components/public/sections/{Name}.tsx`
2. Accept typed props (no data fetching inside the component)
3. Fetch data in the page's `page.tsx` using query function
4. Pass data as props to the component
5. If interactive (filter tabs, accordion), extract the interactive shell to a Client Component

### Updating cache TTL

Change the second argument to `setCached()` or `getCachedOrFetch()` in the relevant API route or page file. Do not touch `lib/cache.ts` for TTL — TTL is a per-call decision at the call site.

---

## Database Quick Reference

**Connection:** Neon serverless HTTP driver via `lib/db.ts`  
**Naming:** snake_case tables and columns  
**PKs:** `BIGSERIAL` (auto-increment, not UUID)  
**Soft delete:** `deleted_at TIMESTAMPTZ NULL` on all content tables  
**Timestamps:** `TIMESTAMPTZ`, always UTC  
**Enumerations:** `VARCHAR` + `CHECK` constraint (never PostgreSQL `ENUM` type)  
**FK ON DELETE:** `RESTRICT` for operational FKs, `SET NULL` for audit/author FKs

**All content tables have these columns:**
```sql
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
deleted_at  TIMESTAMPTZ                          -- NULL = live
created_by  BIGINT REFERENCES admin_users(id) ON DELETE SET NULL
updated_by  BIGINT REFERENCES admin_users(id) ON DELETE SET NULL
```

**Tables and their cache keys:**

| Table | Cache Key Constant |
|-------|--------------------|
| `packages` | `CACHE_KEYS.PACKAGES_ACTIVE`, `CACHE_KEYS.PACKAGES_FEATURED` |
| `departure_schedules` | `CACHE_KEYS.DEPARTURES_PKG(id)` |
| `halal_destinations` | `CACHE_KEYS.HALAL_DEST_ACTIVE` |
| `halal_packages` | `CACHE_KEYS.HALAL_PKGS_ACTIVE` |
| `testimonials` | `CACHE_KEYS.TESTIMONIALS_{CONTEXT}` |
| `faqs` | `CACHE_KEYS.FAQ_{CATEGORY}` |
| `gallery_items` | `CACHE_KEYS.GALLERY_{CATEGORY}` |
| `site_settings` | `CACHE_KEYS.SITE_SETTINGS` |

---

## Auth System Quick Reference

**Admin session flow:**
1. Login → `POST /api/auth/login` → bcrypt verify → JWT signed → stored in Redis as `session:{token}` → httpOnly cookie set
2. Request → `middleware.ts` reads cookie → verifies JWT → checks Redis key exists → passes or redirects
3. API routes → call `requireAuth(req, roles[])` → returns session payload or null

**Roles (lowest to highest privilege):**
```
cs_agent < editor < admin < super_admin
```

**What each role can do:**
- `cs_agent` — view and update lead status only
- `editor` — full CRUD on content (packages, FAQ, gallery, testimonials, destinations, team)
- `admin` — editor + leads management, site settings, audit log view
- `super_admin` — admin + user management, destructive operations

---

## UI Patterns & Component Rules

### Public site
- Use Tailwind CSS utility classes matching the design tokens in `trd.md`
- Color palette CSS vars: `--p6` (purple), `--r4` (pink/CTA), `--g6` (gold), `--n9` (dark text)
- Fonts: `Ubuntu` for headings (`font-ubuntu`), `Inter` for body, `Amiri` for Arabic text
- Every section has `aria-label` for accessibility
- All images use `<Image>` from `next/image` with explicit `width`, `height`, `alt`, `sizes`
- Animation: use Tailwind `animate-` utilities or CSS `@keyframes` — no framer-motion in v1

### Admin panel
- Layout: fixed sidebar (240px) + scrollable main content area
- All lists paginated at 25 items; show total count
- Destructive actions (delete, deactivate) always require a confirmation `<ConfirmDialog>` modal
- All forms show inline validation errors (Zod issues mapped to field names)
- Successful writes show a `<Toast>` notification (success/error variant)
- Reorder interactions use `<SortableList>` wrapper (dnd-kit) — fires `PATCH /api/{model}/reorder` on drop

### Rich text (Tiptap)
- Wrap in `<RichTextEditor>` component from `components/admin/ui/`
- Output: HTML string
- Before storing: sanitize with `isomorphic-dompurify` server-side in the API route
- Before rendering on public site: sanitize again with `isomorphic-dompurify` in the Server Component

---

## Environment Variables Checklist

Before running locally, ensure all of these are set in `.env.local`:

```
DATABASE_URL          ← Neon connection string
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
BLOB_READ_WRITE_TOKEN ← Vercel Blob
JWT_SECRET            ← min 32 chars, random
XENDIT_SECRET_KEY
XENDIT_WEBHOOK_TOKEN
NEXT_PUBLIC_BASE_URL  ← https://ssumroh.id (or localhost)
NEXT_PUBLIC_WA_NUMBER ← 6281312017883
```

---

## Things That Will Silently Fail If You Forget Them

1. **Missing `deleted_at IS NULL` in a query** — will return soft-deleted records to the public site
2. **Missing cache invalidation after a write** — admin saves a new package but public site shows old data for up to TTL minutes
3. **Missing `requireAuth` in an admin API route** — unauthenticated requests can write to DB
4. **`SELECT *` after adding a column** — JSONB or large text columns silently bloat API responses
5. **Using Drizzle query builder in a route** — Drizzle is devDependency and tree-shaken out; will throw at runtime
6. **`fetch('/api/...')` in a Server Component** — works locally but adds latency and can cause issues at Vercel edge

---

## Seed & Migration Workflow

```bash
# Generate migration after schema change
npx drizzle-kit generate

# Apply migration to Neon
npx drizzle-kit migrate

# Run seeds (idempotent — safe to run multiple times)
npx tsx scripts/seed.ts

# Seed files location: drizzle/seeds/00N_*.sql
# Seed files use: INSERT ... ON CONFLICT DO NOTHING
```

---

## Vercel Deployment Checklist

- [ ] All env vars set in Vercel project settings
- [ ] `vercel.json` region set to `sin1` (Singapore)
- [ ] `DATABASE_URL` points to production Neon branch
- [ ] Redis env vars point to production Upstash database
- [ ] `BLOB_READ_WRITE_TOKEN` scoped to production
- [ ] `XENDIT_WEBHOOK_TOKEN` configured in Xendit dashboard → webhook URL set to `https://ssumroh.id/api/webhooks/xendit`
- [ ] Admin user seeded in production DB before first login

---

## What This Project Is NOT

- Not a SPA — there is no client-side router managing page transitions on the public site
- Not using Prisma, TypeORM, Sequelize, or Drizzle query API at runtime
- Not using any ORM `find`, `findMany`, `create`, `update`, `destroy` methods anywhere
- Not storing uploaded images in the database
- Not using `localStorage` for admin auth tokens
- Not using `react-query` or `swr` for server data — Server Components + ISR handle this
