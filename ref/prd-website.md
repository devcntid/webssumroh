# Product Requirements Document — SS Umroh Public Website

**Version:** 1.0  
**Date:** July 2025  
**Author:** Product Team  
**Status:** Draft for Review

---

## 1. Overview

SS Umroh (PT. Sarana Sadaya) is a licensed Umrah travel agency based in Bandung, Indonesia, holding SK PPIU No. U.108/2021 from the Ministry of Religious Affairs. The public website is the primary digital storefront for acquiring leads from prospective jamaah (pilgrims) and corporate clients. All conversion actions funnel to WhatsApp for human-to-human sales closing.

---

## 2. Goals

| Goal | Metric |
|------|--------|
| Increase qualified WhatsApp inquiries | +40% MoM within 6 months of launch |
| Establish institutional trust | PPIU license visible above the fold on all pages |
| Reduce bounce rate | < 55% on mobile |
| Support CMS-driven content updates | Zero developer involvement for package/testimonial/FAQ changes |

---

## 3. Pages & Scope

### 3.1 Page Inventory

| Page | Route | Priority |
|------|-------|----------|
| Homepage | `/` | P0 |
| Umroh Packages | `/paket-umroh` | P0 |
| Halal Tour | `/halal-tour` | P0 |
| Corporate | `/korporat` | P1 |
| About Us | `/tentang-kami` | P1 |
| Destinations | `/destinasi` | P1 |
| Contact | `/kontak` | P1 |

---

## 4. Static Data (Hardcoded — No CMS Required)

These elements are core brand assets or editorial content that changes infrequently and requires developer involvement to update intentionally.

### 4.1 Design System Tokens
- CSS custom properties: full color palette (purple `#7C3ABE` → pink `#F04478`, gold `#D4A017`, neutral scale)
- Typography families: Ubuntu (headings), Inter (body), Amiri (Arabic script)
- Spacing, border-radius, shadow tokens
- Animation keyframes and scroll-triggered animation classes

**Rationale:** Design tokens are a development concern. Changing them implies a brand refresh, not a content update.

### 4.2 Navigation Structure
- Page IDs and their URL paths
- Nav label text ("Umroh", "Halal Tour", "Destinasi", etc.)
- Mega-menu structure and layout (2-column grid)
- Mobile navigation order

**Rationale:** Adding a new page requires routing and layout work regardless; this is not a content-only operation.

### 4.3 Hero Images (URL references)
- Homepage hero (Ka'bah)
- Page-specific heroes (Madinah, Istanbul, corporate meeting, etc.)

**Rationale:** Hero images are art-directed selections tied to design intent. They should be reviewed by design before changing.

### 4.4 Hero Section Copy (per page)
- H1 text, sub-copy, badge labels (e.g., "✓ SK PPIU No.U.108/2021", "✈ Direct Flight", "🛡 0 Gagal Berangkat")
- CTA button labels

**Rationale:** Brand voice copy; changes require copywriting review.

### 4.5 Section Titles & Sub-copy
- All section headers, sub-text, and label tags within each page
- "Why Choose SS Umroh" feature card titles, body text, and icon

**Rationale:** These are brand positioning statements, not operational data.

### 4.6 Destination Editorial Content (Holy Sites)
- Umroh destination cards: Raudhah, Baqi, Quba, Qiblatain, Uhud, Haram, Ka'bah, Zamzam, Sa'i, Arafah, Jabal Nur
- Name, description, historical notes per site

**Rationale:** Sacred historical/religious copy — rarely changes and requires religious accuracy review.

### 4.7 Halal Tour Experience Guide
- Tab categories (Attraction, Heritage, Culinary, Shopping, Nature, Culture)
- Experience items per tab (icon, title, description, country badge)

**Rationale:** Travel editorial content; changes are infrequent and tied to destination additions.

### 4.8 Booking Process Timeline
- 6-step journey (Consultation → Offer → DP → Preparation → Departure → Return)
- Step icons, titles, descriptions, trust badges

**Rationale:** Operational process copy that rarely changes.

### 4.9 Footer Legal & Brand Text
- Company name, operating year, rebranding year
- SK PPIU license number in legal disclaimer
- Privacy Policy and Terms & Conditions link labels
- Social media platform icons

### 4.10 WhatsApp Message Templates
- Pre-filled WA URL message strings per page/context

---

## 5. Dynamic Data (CMS-Managed)

These data entities change frequently due to business operations — new departures, updated pricing, new testimonials, staff changes — and must be editable without developer involvement.

### 5.1 Site Settings
**Frequency of change:** Low (quarterly or on personnel change)  
**Fields:** phone number, WhatsApp number, office address, CS representative name, PPIU license number  
**CMS behavior:** Single-record key-value editor. Changes propagate to header CTA, footer, WhatsApp buttons, and trust strip across all pages.

### 5.2 Umroh Packages
**Frequency of change:** Medium (new season, price update, hotel change)  
**Fields:** name, category (hemat/bintang4/tabungan/ramadhan/group), tag line, short description, hotel distance (meters), flight type, price display mode (contact/number), featured flag, active/inactive status  
**CMS behavior:** Full CRUD. Ordering by drag-and-drop. Toggle featured package. Toggle visibility.

### 5.3 Package Departure Schedules
**Frequency of change:** High (new departures added monthly)  
**Fields:** linked package, departure date, return date, seats total, seats remaining, departure city (CGK/BDO), airline, price override  
**CMS behavior:** Calendar view + list view. Seat counter auto-decremented by booking confirmations. Alert when remaining seats ≤ 5.

### 5.4 Halal Tour Destinations
**Frequency of change:** Low–medium (new country added 1–2× per year)  
**Fields:** country name, flag emoji, badge label, short description, duration string, best season text, starting price, cover image URL, display order, active flag  
**CMS behavior:** Reorderable grid. Toggle active/inactive.

### 5.5 Halal Tour Packages
**Frequency of change:** High (new departure dates, seat counts, promotions)  
**Fields:** linked destination, package name, tag, featured flag, seats remaining, meta chips (duration, airline, hotel class, meals, departure month), highlights text, price, cover image URL, departure date  
**CMS behavior:** Full CRUD with image upload. Featured toggle. Seat counter.

### 5.6 Testimonials
**Frequency of change:** Medium (new testimonials after each departure)  
**Fields:** initials, full name, city/role, package name, star rating (1–5), quote text, page context (general/halal-tour), date collected, verified flag, display order  
**CMS behavior:** Full CRUD. Toggle verified/displayed. Page assignment (which page shows this testimonial). Ordering by drag-and-drop.

### 5.7 FAQs
**Frequency of change:** Low–medium (policy changes, new common questions)  
**Fields:** question, answer (rich text), category (general/halal-tour/korporat), display order, active flag  
**CMS behavior:** CRUD with rich text editor for answers. Category filter. Reorderable within category.

### 5.8 Gallery Images
**Frequency of change:** High (after every departure, new photos uploaded)  
**Fields:** image URL or uploaded file, alt text, caption, category (umroh/halal-tour/korporat), display order, active flag  
**CMS behavior:** Drag-and-drop upload. Masonry preview. Toggle visibility. Categorized tabs.

### 5.9 Team / Staff
**Frequency of change:** Low (hiring, role changes)  
**Fields:** name, role/title, photo URL, department, display order, active flag  
**CMS behavior:** CRUD with photo upload. Toggle display. Ordering.

### 5.10 Corporate Inquiry Leads
**Frequency of change:** Real-time (form submissions)  
**Fields:** company name, contact person, phone, email, estimated pax, travel type, preferred date, notes, status (new/contacted/quoted/closed), created at  
**CMS behavior:** Read-only list for admin. Status updater. Export to CSV. Not editable by content editor role.

### 5.11 Contact Leads (General)
**Frequency of change:** Real-time (form submissions)  
**Fields:** full name, phone, email, subject, message, page source, created at, status  
**CMS behavior:** Lead inbox view. Status workflow (new → read → responded). Not editable.

---

## 6. Page Specifications

### 6.1 Homepage
**Sections:**
1. Hero — full-viewport, dark gradient over Ka'bah image, H1 + badges + 2 CTAs [STATIC copy, DYNAMIC site settings]
2. Stats strip — "1,000+ Jamaah", "12+ Tahun", "0 Gagal Berangkat", "SK PPIU" [STATIC numbers — update via developer if milestones change]
3. Featured Packages — 3 cards pulled from Packages CMS [DYNAMIC]
4. Why Choose Us — 6 feature cards [STATIC]
5. Testimonials — 3 cards from Testimonials CMS (general) [DYNAMIC]
6. FAQ — from FAQs CMS (general category) [DYNAMIC]
7. CTA Banner — [STATIC copy, DYNAMIC phone/WA from site settings]
8. Trust Strip [DYNAMIC site settings]

### 6.2 Umroh Packages Page
**Sections:**
1. Hero — page-hero component [STATIC]
2. Package Cards — full list from Packages CMS [DYNAMIC]
3. Departure Schedule — calendar/list from Schedules CMS [DYNAMIC]
4. Testimonials — general testimonials [DYNAMIC]
5. FAQ — general FAQ [DYNAMIC]
6. CTA Banner [STATIC/DYNAMIC]

### 6.3 Halal Tour Page
**Sections:**
1. Hero [STATIC]
2. Featured Destinations — from Halal Destinations CMS [DYNAMIC]
3. Halal Tour Packages — from Halal Packages CMS [DYNAMIC]
4. Experience Guide tabs (Attraction, Heritage, etc.) [STATIC editorial]
5. Gallery — from Gallery CMS (halal-tour category) [DYNAMIC]
6. Booking Timeline [STATIC]
7. Testimonials — halal-tour testimonials [DYNAMIC]
8. FAQ — halal FAQ [DYNAMIC]
9. CTA Banner

### 6.4 Corporate Page
**Sections:**
1. Hero [STATIC]
2. Corporate Services list [STATIC]
3. Corporate Inquiry Form → POST to leads table [DYNAMIC/FUNCTIONAL]
4. Testimonials — corporate context [DYNAMIC]
5. FAQ — corporate [DYNAMIC]

### 6.5 About Us Page
**Sections:**
1. Hero [STATIC]
2. Company story [STATIC]
3. Milestones (2012–present) [STATIC, developer update on new milestone]
4. Team members — from Team CMS [DYNAMIC]
5. Certifications [STATIC]
6. CTA Banner

### 6.6 Destinations Page
**Sections:**
1. Hero [STATIC]
2. Holy sites grid — 12 destinations [STATIC editorial]
3. Destination detail cards (all with image, desc, distance from masjid) [STATIC]

### 6.7 Contact Page
**Sections:**
1. Hero [STATIC]
2. Contact Info — from Site Settings [DYNAMIC]
3. Contact Form → POST to leads table [FUNCTIONAL]
4. WhatsApp CTA [DYNAMIC phone from site settings]
5. Office Map embed [STATIC coordinates]

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Lighthouse Performance ≥ 85 on mobile
- LCP < 2.5s on 4G connection
- Images served via WebP with lazy loading
- Hero images preloaded

### 7.2 SEO
- Each page has unique `<title>`, `<meta description>`, Open Graph tags
- Structured data: `TravelAgency`, `FAQPage` schema markup
- Sitemap.xml and robots.txt
- Canonical URLs

### 7.3 Accessibility
- WCAG 2.1 AA compliance
- All images have meaningful alt text
- Focus management on mobile menu open/close
- `prefers-reduced-motion` respected for animations

### 7.4 Mobile
- Fully responsive; mobile-first breakpoints at 768px and 1024px
- Bottom bar (WhatsApp + Phone) pinned on mobile
- Floating WhatsApp button on desktop (bottom-right)

### 7.5 Analytics
- Google Analytics 4 with conversion events: `whatsapp_click`, `form_submit`, `package_view`
- UTM parameter preservation on WA links

---

## 8. Out of Scope

- Online payment / booking flow (WA-first sales model)
- User authentication on public site
- Blog / article system
- Multi-language (Bahasa Indonesia only for v1)
- Live chat widget (WhatsApp replaces this)
