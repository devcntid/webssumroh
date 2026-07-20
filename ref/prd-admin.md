# Product Requirements Document — SS Umroh Admin Panel (CMS)

**Version:** 1.0  
**Date:** July 2025  
**Author:** Product Team  
**Status:** Draft for Review

---

## 1. Overview

The Admin Panel is an internal web application used by SS Umroh staff to manage all dynamic content surfaced on the public website. It replaces hardcoded data constants in the codebase with a database-backed CMS, enabling non-technical staff (marketing, CS, operations) to update packages, testimonials, schedules, FAQ, gallery, and leads without involving developers.

---

## 2. Goals

| Goal | Metric |
|------|--------|
| Zero developer involvement for routine content updates | 100% of CMS-marked entities editable via panel |
| CS team responds to new leads within 1 business hour | Lead inbox with status workflow |
| Monthly gallery and testimonial refresh | Upload + publish within 5 minutes per item |
| Accurate seat availability | Real-time seat counter on departure schedules |

---

## 3. Users & Roles

### 3.1 Role Definitions

| Role | Description | Access Level |
|------|-------------|-------------|
| `super_admin` | CTO / Developer. Full access including role management and system settings. | All modules + user management |
| `admin` | Operations manager. Full content CRUD, lead management, cannot manage users. | All modules except user management |
| `editor` | Marketing / content staff. Create and edit content, cannot delete, cannot see personal lead data. | Packages, FAQ, Gallery, Testimonials, Destinations, Team |
| `cs_agent` | Customer service staff. View and update lead statuses only. No content editing. | Leads inbox (read + status update only) |

### 3.2 Authentication
- Email + password login
- bcrypt password hashing
- JWT session with 8-hour expiry
- Refresh token stored in httpOnly cookie
- Password reset via email (SMTP)
- Failed login lockout after 5 attempts (15-minute cooldown)
- No social auth for v1

---

## 4. Module Specifications

---

### 4.1 Dashboard (Home)

**Accessible by:** All roles

**Widgets displayed:**
- **New Leads Today** — count badge with link to Leads inbox
- **Total Active Packages** — Umroh + Halal Tour combined
- **Departures This Month** — list of upcoming schedules with seat availability
- **Seats Alert** — any departure with ≤ 5 seats remaining, highlighted in red
- **Recent Testimonials** — last 3 submitted, pending verification
- **Quick Actions** — shortcuts: Add Package, Add Testimonial, Add FAQ, View Leads

**No editing on dashboard; all widgets are read-only previews.**

---

### 4.2 Site Settings

**Accessible by:** `super_admin`, `admin`

**Purpose:** Edit the single-record `site_settings` table. Changes propagate to all WA buttons, phone links, footer, and trust strip on the public site immediately on next page load (no deploy required).

**Fields (form):**

| Field | Input Type | Notes |
|-------|-----------|-------|
| Phone (display) | Text | Format: 0813-1201-7883 |
| WhatsApp Number | Text | E.164 format without +, e.g. 6281312017883 |
| Office Address | Textarea | Single address |
| CS Representative Name | Text | Used in WA pre-fill and FAQ copy |
| PPIU License Number | Text | e.g. SK PPIU No. U.108 Tahun 2021 |
| Google Maps Embed URL | Text | For contact page map |

**Validation:** WhatsApp number must be numeric, 10–15 digits.  
**Save:** Single "Save Settings" button. Shows success toast and last-updated timestamp.

---

### 4.3 Packages (Umroh)

**Accessible by:** `super_admin`, `admin`, `editor`

**List View:**
- Table columns: Name, Category, Tag, Price Display, Featured, Status, Actions
- Filter by: Category, Status (active/inactive)
- Drag-and-drop row reorder (updates `display_order`)
- Quick toggle: Featured / Active (inline switch)

**Create / Edit Form:**

| Field | Input | Validation |
|-------|-------|-----------|
| Package Name | Text | Required, max 80 chars |
| Category | Select | hemat, bintang4, tabungan, ramadhan, group |
| Tag Line | Text | e.g. "Paling Populer", max 40 chars |
| Short Description | Textarea | Max 200 chars |
| Hotel Distance (meters) | Number | 0–2000 |
| Flight Type | Text | e.g. "Direct ✈" |
| Price Display Mode | Select | "contact" or "number" |
| Price (IDR) | Number | Required if mode = number |
| Price Display Text | Text | Override display string, e.g. "Mulai Rp 15,5 Jt" |
| Cover Image | URL input + upload | Accepts URL or file upload |
| Featured | Toggle | Only one package can be featured |
| Active | Toggle | Inactive = hidden from public site |
| Display Order | Auto-managed by drag-and-drop | Editable as number fallback |

**Delete:** Soft-delete (sets `deleted_at`). Cannot delete if active departures reference this package. Show warning and block.

---

### 4.4 Departure Schedules

**Accessible by:** `super_admin`, `admin`, `editor`

**Purpose:** Manage departure dates tied to Umroh or Halal Tour packages.

**List View:**
- Calendar view (month) + List view toggle
- Color-coded by package category
- Status badge: Upcoming / Ongoing / Completed / Cancelled
- Alert badge when `seats_remaining ≤ 5`

**Create / Edit Form:**

| Field | Input | Validation |
|-------|-------|-----------|
| Package | Select (from active packages) | Required |
| Departure Date | Date picker | Must be future date |
| Return Date | Date picker | Must be after departure |
| Departure City | Select | CGK (Jakarta), BDO (Bandung), SUB (Surabaya) |
| Airline | Text | e.g. "Garuda Indonesia", "Saudi Airlines" |
| Total Seats | Number | Min 1, max 200 |
| Seats Remaining | Number | Auto-managed; editable for corrections |
| Price Override (IDR) | Number | Overrides package base price for this schedule only |
| Status | Select | upcoming, ongoing, completed, cancelled |
| Notes (internal) | Textarea | Not shown on public site |

**Seats Remaining Auto-Decrement:** When a corporate/lead is marked "confirmed", CS agent can manually decrement. Full automation (e-commerce) is out of scope for v1.

---

### 4.5 Halal Destinations

**Accessible by:** `super_admin`, `admin`, `editor`

**List View:**
- Grid preview with destination cover image, country name, price, active status
- Drag-and-drop reorder

**Create / Edit Form:**

| Field | Input | Validation |
|-------|-------|-----------|
| Country Name | Text | Required |
| Flag Emoji | Text | Single emoji character |
| Badge Label | Text | e.g. "🔥 Terpopuler", max 40 chars |
| Short Description | Textarea | Max 300 chars |
| Duration | Text | e.g. "10D7N" |
| Best Season | Text | e.g. "Mar–Mei, Sep–Nov" |
| Starting Price | Text | Display string e.g. "Rp 15,5 Jt" |
| Cover Image | URL + upload | |
| Active | Toggle | |
| Display Order | Auto (drag-and-drop) | |

---

### 4.6 Halal Tour Packages

**Accessible by:** `super_admin`, `admin`, `editor`

**Same structure as Umroh Packages with additional fields:**

| Field | Input | Notes |
|-------|-------|-------|
| Linked Destination | Select (from active Halal Destinations) | Required |
| Meta Chips | Dynamic list | e.g. ["9D6N", "Garuda Direct", "Hotel Bintang 4"] — up to 6 chips |
| Highlights Text | Textarea | "·"-separated attractions list |
| Seats Remaining | Number | Shown as urgency indicator on public site |
| Departure Month | Text | e.g. "Mar 2026" |

---

### 4.7 Testimonials

**Accessible by:** `super_admin`, `admin`, `editor`

**List View:**
- Cards with star rating, quote preview, author name, page assignment, verified badge, active status
- Filter by: Page (general/halal-tour/korporat), Verified, Active
- Bulk action: verify selected, deactivate selected

**Create / Edit Form:**

| Field | Input | Validation |
|-------|-------|-----------|
| Full Name | Text | Required |
| Initials | Text | Auto-generated from name (2 chars), overrideable |
| City / Role | Text | e.g. "Bandung" or "HR Manager, PT. XYZ" |
| Package Name | Text | e.g. "Paket Bintang 4" |
| Star Rating | Select 1–5 | Default 5 |
| Quote | Textarea | Required, max 400 chars |
| Page Assignment | Multi-select | general, halal-tour, korporat |
| Date Collected | Date | |
| Verified | Toggle | Unverified = hidden from public |
| Active | Toggle | |
| Display Order | Number | |

---

### 4.8 FAQ

**Accessible by:** `super_admin`, `admin`, `editor`

**List View:**
- Accordion-style list grouped by category
- Drag-and-drop within category to reorder
- Toggle active/inactive inline

**Create / Edit Form:**

| Field | Input | Validation |
|-------|-------|-----------|
| Question | Text | Required, max 200 chars |
| Answer | Rich text (basic: bold, italic, links, bullets) | Required |
| Category | Select | general, halal-tour, korporat |
| Active | Toggle | |
| Display Order | Auto (drag-and-drop) | |

---

### 4.9 Gallery

**Accessible by:** `super_admin`, `admin`, `editor`

**List View:**
- Masonry grid with image thumbnails
- Filter by category
- Drag-and-drop reorder
- Multi-select for bulk actions (activate/deactivate/delete)

**Upload Form:**
- Drag-and-drop file upload or URL paste
- Auto-generates thumbnail on upload
- Fields: Alt Text (required), Caption (optional), Category (umroh/halal-tour/korporat/general), Display Order, Active toggle
- Accepts: JPG, PNG, WebP — max 8MB per file
- Bulk upload: up to 20 images at once
- Auto-resize to max 1200px width on server

---

### 4.10 Team Members

**Accessible by:** `super_admin`, `admin`, `editor`

**Create / Edit Form:**

| Field | Input | Validation |
|-------|-------|-----------|
| Full Name | Text | Required |
| Role / Title | Text | e.g. "CS Manager", max 80 chars |
| Department | Select | Operations, Marketing, Customer Service, Finance |
| Photo | URL + upload | Auto-crop to square |
| Display Order | Number | |
| Active | Toggle | |

---

### 4.11 Leads Inbox — General Contact

**Accessible by:** `super_admin`, `admin`, `cs_agent`  
**Editor cannot access leads (personal data privacy).**

**List View:**
- Columns: Date, Name, Phone, Email, Subject, Page Source, Status
- Filter by: Status, Date range, Page Source
- Sort by: Date (newest first default)
- Search by: Name, Phone, Email

**Lead Detail View (read-only):**
- All form fields
- Status workflow buttons: New → Read → Responded → Closed
- Internal notes textarea (append-only log)
- Quick action: Click-to-call, Click-to-WhatsApp
- Export: CSV download (all or filtered)

**Status Definitions:**
| Status | Meaning |
|--------|---------|
| new | Not yet opened by any agent |
| read | Opened, not yet contacted |
| responded | CS has contacted the prospect |
| closed | Converted or disqualified |

---

### 4.12 Leads Inbox — Corporate Inquiries

**Accessible by:** `super_admin`, `admin`, `cs_agent`

**Additional fields vs general leads:**
- Company Name
- Estimated Pax
- Travel Type (umroh/halal-tour/both)
- Preferred Travel Date
- Same status workflow as general leads

---

### 4.13 User Management

**Accessible by:** `super_admin` only

**List View:** Table with Name, Email, Role, Last Login, Active status

**Create / Edit:**
- Name, Email, Role (select), Temporary Password (shown once on create), Active toggle

**Actions:**
- Deactivate (does not delete)
- Reset password (sends email)
- View audit log for user

---

### 4.14 Audit Log

**Accessible by:** `super_admin`, `admin`

**Purpose:** Tamper-evident log of all create/update/delete actions.

**Columns:** Timestamp, User, Action (created/updated/deleted), Entity Type, Entity ID, Changed Fields (JSON diff)

**Read-only. Non-pageable CSV export for compliance.**

---

## 5. Global UX Requirements

### 5.1 Layout
- Sidebar navigation (collapsible on mobile)
- Top bar: current user name, role badge, logout button
- Breadcrumb trail on all sub-pages
- Active module highlighted in sidebar

### 5.2 List Views
- Pagination: 25 items per page default (10/25/50 selector)
- Column sort on all text/date columns
- Search within module (client-side for < 500 records, server-side otherwise)
- Empty states with CTA to create first item

### 5.3 Forms
- Auto-save draft to `localStorage` after 30 seconds of inactivity
- Unsaved changes warning on navigate away
- Field-level inline validation (on blur)
- Submit state: loading spinner, success toast, error toast
- All required fields marked with `*`

### 5.4 Image Upload
- Preview before save
- Progress bar for upload
- Error on unsupported format or oversized file

### 5.5 Drag-and-Drop Ordering
- Available on: Packages, Halal Destinations, Halal Packages, Testimonials, FAQ (within category), Gallery
- Reorder saves immediately on drop (optimistic UI with rollback on error)

### 5.6 Deletion
- All deletes require confirmation modal: "Are you sure? This cannot be undone."
- Soft-delete pattern: records get `deleted_at` timestamp, not removed from DB
- Items with active FK references (e.g., package with active departures) cannot be deleted; show blocker modal listing dependent records

---

## 6. Non-Functional Requirements

### 6.1 Security
- HTTPS only (TLS 1.2+)
- All API endpoints require valid JWT
- Role-based access enforced server-side (not just UI)
- XSS prevention: all user input sanitized before render
- SQL injection prevention: parameterized queries only
- Rate limiting on login endpoint: 5 req/min per IP
- CORS restricted to admin domain origin

### 6.2 Performance
- Dashboard initial load < 2s on broadband
- Image upload response < 5s for files under 8MB
- List views paginated to prevent N+1 query issues

### 6.3 Availability
- Target uptime: 99.5% (admin usage is business-hours-heavy)
- Graceful error pages (no stack traces shown to users)

### 6.4 Audit & Compliance
- All write operations logged to `audit_log` table
- Personal data (leads) accessible only to roles with explicit grant
- Data retained for 2 years minimum (leads, audit log)

---

## 7. Technical Architecture Notes

- **Frontend:** React (Next.js recommended) or any SPA with protected routes
- **Backend API:** REST or tRPC; same codebase as public site API preferred
- **Database:** PostgreSQL (see ERD document)
- **File Storage:** S3-compatible bucket (e.g., Cloudflare R2) for uploaded images; URLs stored in DB
- **Auth:** JWT + refresh token; bcrypt for passwords
- **Rich Text:** Minimal editor (e.g., Tiptap with bold/italic/link/bullet support only) — no HTML passthrough to avoid XSS

---

## 8. Out of Scope (v1)

- Public registration / customer portal
- Online payment processing
- Automated email marketing
- Multi-language admin interface
- Mobile native app for admin
- Advanced analytics / BI dashboard
- Automated WhatsApp bot integration
- Document generation (visa letters, contracts) — manual process for v1
