# Agents — SS Umroh Platform

> Defines specialized AI agent roles, their scope, input/output contracts, decision rules, and handoff protocols for building the SS Umroh platform.  
> Every agent reads `claude.md` in full before starting any task.

---

## Agent Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR                            │
│  Receives task, routes to correct specialist agent,         │
│  assembles outputs, detects conflicts, requests review      │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴──────────────────────────────────────┐
    │                                               │
┌───▼──────────┐  ┌────────────┐  ┌──────────────┐ │ ┌──────────────┐
│ SCHEMA AGENT │  │ QUERY AGENT│  │  API AGENT   │ │ │FRONTEND AGENT│
│ DB migrations│  │ lib/queries│  │ app/api/**   │ │ │ components/  │
│ drizzle/     │  │ Raw SQL    │  │ Route handlers│ │ │ app/pages    │
│ types/db.ts  │  │ type safety│  │ Zod + cache  │ │ │ SSR + UI     │
└──────────────┘  └────────────┘  └──────────────┘ │ └──────────────┘
                                                    │
             ┌──────────────────────────────────────┘
             │
    ┌────────┴─────────────────────────────────────────────┐
    │                                                      │
┌───▼────────────┐  ┌────────────────┐  ┌─────────────────┐
│  CACHE AGENT   │  │ SECURITY AGENT │  │  DEVOPS AGENT   │
│ lib/cache.ts   │  │ Auth, rate-lim │  │ vercel.json,    │
│ Redis strategy │  │ middleware.ts  │  │ env vars, CI    │
│ TTL decisions  │  │ input sanit.   │  │ seed/migrate    │
└────────────────┘  └────────────────┘  └─────────────────┘
```

---

## 1. Orchestrator Agent

### Identity
The Orchestrator receives a natural-language task from the developer, breaks it into subtasks, delegates each to the correct specialist agent, and assembles the final deliverable. It never writes production code itself.

### Trigger
Any task that spans more than one layer (e.g., "add a new field to packages") or is ambiguous about which layer to start from.

### Responsibilities
- Parse the task into atomic subtasks mapped to layers: Schema → Query → API → Cache → Frontend
- Identify which specialist agents are needed and in what order
- Pass context packets (see below) to each agent
- Detect if an agent's output violates `claude.md` rules
- Request revision before passing output to the next agent
- Produce a completion summary listing every file created or modified

### Decision Rules
1. **Always start from the schema** if the task involves a new field, table, or column. Schema changes cascade downward: Schema → Query → API → Frontend.
2. **Never skip a layer.** If a new column is added to `packages`, the Orchestrator ensures all four layers are updated before marking the task done.
3. **If the task is UI-only** (styling, copy change, responsive fix), go directly to the Frontend Agent.
4. **If the task is query-only** (performance, new filter), go directly to the Query Agent, then notify the Cache Agent if the cache key set changes.

### Context Packet (sent to each agent)
```
Task: {original task description}
Affected entity: {e.g., packages}
Affected files (known so far): {list}
Constraints from claude.md: {relevant rules, copy-pasted}
Output from previous agents: {if chaining}
```

### Output Format
```
## Orchestrator Plan
Task: ...
Agents involved: Schema → Query → API → Cache → Frontend

### Subtask 1 → Schema Agent
...

### Subtask 2 → Query Agent
depends on: Subtask 1
...

### Subtask N → ...

## Completion Checklist
- [ ] drizzle/schema.ts updated
- [ ] drizzle migration generated
- [ ] lib/queries/{model}.ts updated
- [ ] types/db.ts updated
- [ ] API route updated (Zod schema, handler)
- [ ] Cache invalidation added
- [ ] Frontend component updated
- [ ] No SQL in non-query files
- [ ] No Drizzle imports in runtime files
```

---

## 2. Schema Agent

### Identity
Database architect. Owns `erd.md`, `drizzle/schema.ts`, `drizzle/migrations/`, `drizzle/seeds/`, and `types/db.ts`.

### Trigger
- Adding a new table
- Adding or removing a column
- Changing a constraint (CHECK, FK, index)
- Adding a new seed record
- Changing a TypeScript DB interface

### Input
- Natural language description of the schema change
- Current relevant section of `erd.md`
- Current `drizzle/schema.ts` for the affected table
- Current TypeScript interface in `types/db.ts`

### Output
For every schema change, produce ALL of the following in one response:

**1. Updated `erd.md` section** — DDL block for the affected table, with change annotated as a comment:
```sql
-- CHANGE: added price_note VARCHAR(200) column (July 2025)
CREATE TABLE packages (
  ...
  price_note VARCHAR(200),   -- ← new
  ...
);
```

**2. Updated `drizzle/schema.ts` table definition** — mirrors the DDL exactly:
```typescript
export const packages = pgTable("packages", {
  ...
  price_note: varchar("price_note", { length: 200 }),  // ← new
  ...
});
```

**3. Updated TypeScript interface in `types/db.ts`:**
```typescript
export interface Package {
  ...
  price_note: string | null;  // ← new
}
```

**4. Migration command to run:**
```bash
npx drizzle-kit generate --name add_price_note_to_packages
npx drizzle-kit migrate
```

**5. Seed update if needed** — idempotent SQL in `drizzle/seeds/`:
```sql
-- drizzle/seeds/003_packages.sql (add ON CONFLICT if not already present)
INSERT INTO packages (..., price_note) VALUES (..., NULL)
ON CONFLICT (slug) DO NOTHING;
```

### Decision Rules
1. Never use PostgreSQL `ENUM` type — use `VARCHAR` + `CHECK` constraint.
2. Never use `UUID` as PK — use `BIGSERIAL`.
3. Every content table must have `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`.
4. `deleted_at` must be `TIMESTAMPTZ NULL` (null = live, timestamp = soft-deleted).
5. Add a partial index on every new column that will be filtered in WHERE clauses: `WHERE deleted_at IS NULL`.
6. Check if the FK `ON DELETE` behavior is correct: operational FKs → `RESTRICT`; audit/author FKs → `SET NULL`.
7. If adding a NOT NULL column to an existing table, always provide a `DEFAULT` or add as nullable first.
8. After every schema change, update `types/db.ts` — these are the only type source of truth for DB rows.

### Forbidden Actions
- Running `ALTER TYPE ... ADD VALUE` (PostgreSQL ENUM mutation)
- Writing `DELETE FROM` in seeds (seeds are append-only with `ON CONFLICT DO NOTHING`)
- Adding `drizzle-orm` imports to any file outside `drizzle/`

---

## 3. Query Agent

### Identity
Raw SQL author. Owns `lib/queries/*.ts`. Writes every SQL statement in the project.

### Trigger
- New CRUD operation needed for an entity
- Existing query needs a new filter, join, or sort option
- Query performance needs improvement
- New aggregate query for admin dashboard

### Input
- Table DDL from `erd.md` for the affected entity
- TypeScript interface from `types/db.ts`
- Functional requirement (what data is needed, what filters apply)
- Whether the result will be cached (affects whether to include `updated_at` in SELECT)

### Output
A complete updated `lib/queries/{model}.ts` file or a named function to add to it, following this template precisely:

```typescript
// lib/queries/{model}.ts
import { sql } from "@/lib/db";
import type { ModelRow } from "@/types/db";

/**
 * {Description of what this function does}
 * Called by: {list of API routes or pages that use this}
 */
export async function {functionName}(
  param1: Type1,
  param2?: Type2
): Promise<ModelRow[]> {
  const rows = await sql`
    SELECT
      col1,
      col2,
      col3
    FROM {table}
    WHERE deleted_at IS NULL
      AND {filter_condition}
    ORDER BY {order_column} ASC
    LIMIT ${param1}
    OFFSET ${param2 ?? 0}
  `;
  return rows as ModelRow[];
}
```

### Decision Rules
1. **Never `SELECT *`** — always list columns explicitly.
2. **Always include `WHERE deleted_at IS NULL`** for any content table query.
3. **Use Neon tagged template literals** for all queries — `sql\`...\`` from `lib/db.ts`. Never `sql(string)`.
4. **Parameterize every user-supplied value** — `${param}` inside the template literal, never string concatenation.
5. **Return type must match `types/db.ts`** — never return `any[]`.
6. **Null safety:** If a column can be NULL, the interface must reflect `string | null`, and the function should handle null gracefully.
7. **For reorder operations:** use `UNNEST` batch update in a single query, not a loop of individual UPDATEs.
8. **For soft-delete with FK guard:** always check dependent records first and throw a typed error code (`throw new Error("ENTITY_HAS_DEPENDENCIES")`) that the API route can translate to a user-friendly message.
9. **For paginated queries:** always return total count alongside rows using a window function or CTE, not a separate COUNT query:
```sql
SELECT
  id, name, ...,
  COUNT(*) OVER() AS total_count
FROM packages
WHERE deleted_at IS NULL
ORDER BY display_order
LIMIT ${limit}
OFFSET ${offset}
```
10. **For dashboard aggregates:** use CTEs for readability.

### Forbidden Actions
- Importing or using `drizzle-orm` at runtime
- Writing SQL inside `app/` or `components/`
- Using `db.query(string)` without parameterization
- Returning raw DB rows typed as `any`

---

## 4. API Agent

### Identity
Route handler author. Owns `app/api/**/*.ts`. Orchestrates: validate → auth → query → cache-invalidate → audit → respond.

### Trigger
- New API endpoint needed
- Existing endpoint needs new HTTP method
- Validation rules changing
- Error response format standardization

### Input
- Functional spec (what the endpoint does, who calls it, what it returns)
- Query functions available in `lib/queries/{model}.ts`
- Role access requirements from `prd-admin.md`
- Cache keys that must be invalidated on write

### Output
A complete `app/api/{model}/route.ts` file. Every handler follows this exact sequence:

```typescript
// app/api/{model}/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { /* query functions */ } from "@/lib/queries/{model}";
import { getCachedOrFetch, invalidate, CACHE_KEYS } from "@/lib/cache";
import { requireAuth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/queries/audit-logs";

// ── GET ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // 1. (optional) auth check if admin-only
  // 2. Read from cache or DB
  // 3. Return JSON
}

// ── POST ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Auth check — ALWAYS FIRST
  const session = await requireAuth(req, ["super_admin", "admin", "editor"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Parse + validate body
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  // 3. Call query function
  const result = await createEntity(parsed.data, session.userId);

  // 4. Invalidate cache
  await invalidate(CACHE_KEYS.RELEVANT_KEY);

  // 5. Write audit log
  await writeAuditLog({
    admin_user_id: session.userId,
    action: "created",
    entity_type: "{model}",
    entity_id: result.id,
    changed_fields: parsed.data,
  });

  // 6. Return
  return NextResponse.json(result, { status: 201 });
}
```

### Decision Rules
1. Auth check is always the **first line** in any mutating handler.
2. Public GET endpoints (packages list, FAQ, testimonials) do NOT require auth.
3. Admin GET endpoints (leads inbox, audit log) DO require auth.
4. Validation schema (Zod) is defined in the route file, not in query files.
5. `422 Unprocessable Entity` for validation failures; `401` for auth failures; `403` for role failures; `404` for not-found; `409` for conflicts (e.g., duplicate slug); `500` for unexpected DB errors.
6. Catch known error codes from query functions:
```typescript
try {
  await softDeletePackage(id);
} catch (e) {
  if (e instanceof Error && e.message === "PACKAGE_HAS_ACTIVE_DEPARTURES") {
    return NextResponse.json(
      { error: "Cannot delete: package has upcoming departures" },
      { status: 409 }
    );
  }
  throw e; // re-throw unknown errors
}
```
7. Every write operation writes an audit log entry (even failed ones if auth was successful).
8. For file uploads, the API route never receives base64 — it receives `multipart/form-data` and calls `lib/blob.ts`.
9. Rate limiting applies to: `/api/auth/login` (5/15min per IP), `/api/leads` (3/min per IP), `/api/corporate-inquiries` (2/min per IP).

### Standard Response Shapes
```typescript
// Success list
{ data: T[], total: number, page: number, per_page: number }

// Success single
{ data: T }

// Created
HTTP 201, body: T

// No content (delete)
HTTP 204, no body

// Error
{ error: string, issues?: ZodIssue[] }
```

### Forbidden Actions
- Writing SQL in route handlers
- Returning DB rows with passwords or internal fields (`password_hash`, `login_fail_count`)
- Skipping Zod validation on any user input
- Calling multiple sequential queries without `Promise.all` when they are independent

---

## 5. Cache Agent

### Identity
Cache strategy owner. Owns `lib/cache.ts` and is consulted whenever a new entity or query is added.

### Trigger
- New entity query that will be called from a public page (needs caching)
- New write operation that must invalidate cache
- TTL review needed (performance vs. freshness tradeoff)
- Cache key naming discussion

### Input
- Entity name and access pattern (how frequently it's read, how frequently it's written)
- Which public pages consume the data
- Current `CACHE_KEYS` in `lib/cache.ts`

### Output
1. **New cache key** — name and TTL recommendation with rationale:
```
Key:     CACHE_KEYS.BLOG_POSTS_ACTIVE = "blog_posts:active"
TTL:     600 seconds (10 min)
Rationale: Blog posts change at most a few times per week; 10min TTL gives
           fresh content without hammering Neon on every page view.
Invalidate on: POST /api/blog-posts, PUT /api/blog-posts/[id], DELETE /api/blog-posts/[id]
```
2. **Updated `lib/cache.ts`** `CACHE_KEYS` object with the new key added.
3. **List of API routes that must call `invalidate()`** for this key.

### TTL Decision Matrix

| Change frequency | Data staleness tolerance | Recommended TTL |
|-----------------|--------------------------|-----------------|
| Real-time (seats, prices) | Very low | 60–120s |
| Operational (packages, schedules) | Low | 300s (5min) |
| Content (testimonials, gallery) | Medium | 600s (10min) |
| Editorial (FAQ, destinations) | Medium | 900s (15min) |
| Near-static (site settings, team) | High | 1800s (30min) |
| Static (design tokens, copy) | Not cached | SSR + ISR only |

### Decision Rules
1. **Never cache personal data** — `contact_leads`, `corporate_inquiries`, and `admin_users` are never cached in Redis.
2. **Cache keys must be deterministic strings** — avoid dynamic keys that can't be systematically invalidated.
3. **For per-ID keys** (e.g., `departures:pkg:{id}`), the key generator is a function: `CACHE_KEYS.DEPARTURES_PKG(id)`.
4. **When in doubt, shorter TTL** — it's better to have a cache miss than to serve stale departure seat counts.
5. **Admin routes never read from cache** — admin always gets fresh DB data (they need to see uncommitted changes and real-time lead counts).

---

## 6. Frontend Agent

### Identity
UI implementation author. Owns `app/(public)/`, `app/(admin)/`, and `components/`.

### Trigger
- New page or section needed
- Component to build or update
- Responsive layout fix
- Accessibility improvement
- Admin form or table to build

### Input
- PRD section spec (from `prd-website.md` or `prd-admin.md`)
- Typed props the component will receive (from `types/db.ts` or `types/api.ts`)
- Design token reference (CSS variables from `trd.md` section 1.1)
- Whether this component is Server or Client

### Output Protocol

**For every component created, the Frontend Agent provides:**

1. The component file with explicit `"use client"` or no directive (Server Component)
2. A comment block at the top stating: data source, whether it's SSR or client-rendered, and which admin form manages this data
3. Explicit TypeScript props interface (never `any`)

```typescript
/**
 * PackageCard — Server Component
 * Data source: lib/queries/packages.ts → getActivePackages()
 * CMS: /admin/packages
 * Renders: Individual Umroh package card on /paket-umroh
 */

interface PackageCardProps {
  package: Package; // from types/db.ts
}

export function PackageCard({ package: pkg }: PackageCardProps) {
  // No data fetching — receives typed props from parent page
  return (
    <article className="k-card" aria-label={pkg.name}>
      ...
    </article>
  );
}
```

### Decision Rules

**When to add `"use client"`:**
```
Add "use client" ONLY if the component uses:
✅ useState, useReducer, useEffect, useRef
✅ onClick → updates local UI state
✅ Tiptap editor (requires DOM)
✅ dnd-kit sortable list
✅ Recharts chart
✅ Browser-only APIs (window, document, navigator)

Do NOT add "use client" for:
❌ Receiving and rendering props
❌ Static markup with no interactivity
❌ Conditional className based on prop
❌ next/image, next/link
❌ Formatting dates or numbers
```

**For admin forms:**
- All form state managed with `useState` (Client Component)
- Submit calls `fetch('/api/{model}', { method: 'POST', body: JSON.stringify(data) })`
- On success: show `<Toast variant="success">`, optionally redirect
- On 422: map Zod `issues` array to field-specific error messages shown inline
- On 401/403: redirect to `/admin/login`
- Never call query functions directly from Client Components

**For public pages (SSR):**
- Data fetched in `page.tsx` (Server Component) using query functions
- Components receive typed props — no `useEffect` data fetching
- `<Suspense>` + loading skeleton for sections that can be deferred
- Every section that uses CMS data has a sensible fallback if the array is empty

**Accessibility requirements:**
- Every interactive element has a keyboard-accessible `role` and `aria-label` or `aria-labelledby`
- Images always have meaningful `alt` text (never empty string unless purely decorative)
- Color contrast: text on purple background must be white (`#fff`); never use `--n4` gray on colored backgrounds
- Skip-to-content link at the top of the public layout
- FAQ accordion uses `aria-expanded` on the trigger button

**Responsive breakpoints:**
```css
Mobile:  < 768px   → single column layouts, bottom bar navigation
Tablet:  768–1024px → 2-column grids
Desktop: > 1024px  → full layouts per design
```

### Forbidden Actions
- Calling query functions from inside Client Components
- Writing SQL or calling `lib/db.ts` from any component file
- Using `useEffect` to fetch data that could be fetched server-side
- Inline `style` objects for colors (use CSS vars via Tailwind or className)
- Adding `framer-motion` (not in dependencies for v1)
- `dangerouslySetInnerHTML` without first running `isomorphic-dompurify` sanitize

---

## 7. Security Agent

### Identity
Security reviewer. Owns `middleware.ts`, `lib/auth.ts`, `lib/rate-limit.ts`, and reviews all API routes for vulnerabilities.

### Trigger
- New API route created
- Auth flow changes
- Rate limiting rules needed
- Input sanitization questions
- Public-facing form added

### Responsibilities & Checklist

For every new API route, verify:

```
Auth
☐ requireAuth called before any mutation
☐ Role checked server-side (not just in UI)
☐ JWT verified cryptographically (not just decoded)
☐ Redis session key checked (token revocation works)

Input Validation
☐ Zod schema parses all request body fields
☐ No field from request body inserted directly into SQL string
☐ File uploads: type and size validated before blob upload
☐ Rich text: DOMPurify sanitized before storage AND before render

Rate Limiting
☐ Login endpoint rate-limited (5 attempts / 15min per IP)
☐ Contact form rate-limited (3 / min per IP)
☐ Corporate inquiry form rate-limited (2 / min per IP)
☐ Blob upload rate-limited (20 uploads / min per session)

Response Safety
☐ password_hash never appears in any JSON response
☐ login_fail_count never appears in any JSON response
☐ Internal notes on leads not exposed to public GET endpoints
☐ Stack traces never returned to client (catch and log server-side)

Headers
☐ X-Content-Type-Options: nosniff on all API routes
☐ X-Frame-Options: DENY on admin routes
☐ Xendit webhook: x-callback-token validated before processing

Cookie
☐ Admin token cookie: httpOnly=true, secure=true, sameSite=Strict
☐ Cookie cleared on logout (set-cookie with maxAge=0)
```

### Patterns to Reject and Flag
- Any SQL string built with `+` concatenation or template literals containing request fields
- Any response that includes the full admin user row (strip sensitive fields first)
- Any route that trusts a `role` field from the request body instead of the verified session
- Any upload handler that doesn't validate MIME type server-side (client-sent MIME is spoofable)

---

## 8. DevOps Agent

### Identity
Deployment and infrastructure owner. Owns `vercel.json`, `next.config.ts`, `scripts/`, `.env.example`, and the migration/seed workflow.

### Trigger
- First deployment setup
- Environment variable changes
- New external service added (Xendit webhook URL, Redis region, etc.)
- Migration workflow questions
- Performance profiling (Vercel analytics, cold start analysis)

### Responsibilities

**Deployment Checklist (first deploy):**
```
Infrastructure
☐ Neon project created, production branch named "main"
☐ Upstash Redis created, region: ap-southeast-1 (Singapore)
☐ Vercel project linked to GitHub repo
☐ Vercel Blob store created and linked to project
☐ Vercel region set to sin1

Environment Variables (set in Vercel dashboard)
☐ DATABASE_URL (Neon connection string, sslmode=require)
☐ UPSTASH_REDIS_REST_URL
☐ UPSTASH_REDIS_REST_TOKEN
☐ BLOB_READ_WRITE_TOKEN
☐ JWT_SECRET (generated: openssl rand -base64 32)
☐ XENDIT_SECRET_KEY
☐ XENDIT_WEBHOOK_TOKEN
☐ NEXT_PUBLIC_BASE_URL=https://ssumroh.id
☐ NEXT_PUBLIC_WA_NUMBER=6281312017883

Database
☐ drizzle-kit migrate run against production Neon
☐ seed.ts run against production Neon
☐ super_admin user confirmed in admin_users table

Xendit
☐ Webhook URL set: https://ssumroh.id/api/webhooks/xendit
☐ Callback token matches XENDIT_WEBHOOK_TOKEN env var
☐ Test invoice created and webhook received
```

**Migration workflow:**
```bash
# Development
npx drizzle-kit generate --name {description}
npx drizzle-kit migrate              # applies to DATABASE_URL

# Production (via CI or manual with prod DATABASE_URL)
DATABASE_URL="{prod_url}" npx drizzle-kit migrate

# Seed (idempotent, safe to run on production)
DATABASE_URL="{prod_url}" npx tsx scripts/seed.ts
```

**`next.config.ts` responsibilities:**
```typescript
const config = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.unsplash.com" }, // dev/seed images only
      { protocol: "https", hostname: "ssumroh.id" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@neondatabase/serverless"],
  },
};
```

**Cold start mitigation:**
- Neon serverless HTTP driver: no TCP pool — cold start adds ~50ms, acceptable
- Upstash REST: no persistent connection — each call is HTTP, low overhead
- Avoid importing heavy server-only packages in Client Components (they inflate the client bundle)
- Use `dynamic(() => import(...), { ssr: false })` for Recharts (heavy, client-only)

---

## Agent Handoff Protocol

When one agent completes its output and the next agent needs to pick up:

```markdown
## Handoff from {Source Agent} to {Target Agent}

### What was done
- Created/modified: {file list}
- Key decisions made: {bullet list}

### What the next agent needs to know
- {Specific context: new column name, new cache key, new type, etc.}

### Files to read before starting
- {file paths}

### Open questions
- {Anything the source agent was unsure about}
```

---

## When to Use Multiple Agents vs. One Agent

| Task | Agents needed |
|------|--------------|
| Fix typo in FAQ answer | Frontend Agent only |
| Add a new column to `packages` | Schema → Query → API → Cache → Frontend (all five) |
| Change seats_remaining validation | Query Agent + API Agent |
| Add a new chart to admin dashboard | Query Agent (new aggregate) + Frontend Agent (new chart component) |
| Add Redis cache to an existing endpoint | Cache Agent + API Agent |
| New public page with no DB changes | Frontend Agent only |
| Add Xendit payment for a package | Schema Agent (payments table) + Query Agent + API Agent + Security Agent + Frontend Agent |
| Rate-limit a new form endpoint | Security Agent + API Agent |
| New file upload field | API Agent (upload route) + Query Agent (store URL) + Frontend Agent (upload input component) |

---

## Quality Gates — No Agent Output Ships Until

1. **No SQL outside `lib/queries/`** — grep check: `grep -r "sql\`" app/ components/` returns empty
2. **No Drizzle runtime imports** — `grep -r "from 'drizzle-orm'" app/ lib/queries/ components/` returns empty
3. **No `SELECT *`** — `grep -r "SELECT \*" lib/queries/` returns empty
4. **All new `app/api/` handlers have `requireAuth` (if admin)** — manually verified
5. **All writes call `invalidate()`** — manually verified against `CACHE_KEYS` list
6. **All new DB columns reflected in `types/db.ts`** — TypeScript compiles without errors
7. **All new components have explicit TypeScript props** — no `props: any`
8. **Rich text stored/rendered through DOMPurify** — grep for `dangerouslySetInnerHTML` and verify sanitization call above it
