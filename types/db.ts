export type AdminRole = "super_admin" | "admin" | "editor" | "cs_agent";

export type PackageCategory = "hemat" | "bintang4" | "tabungan" | "ramadhan" | "group";
export type PriceMode = "contact" | "number";
export type ScheduleStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type FaqCategory = "general" | "halal-tour" | "korporat";
export type PageContext = "general" | "halal-tour" | "korporat";
export type GalleryCategory = "umroh" | "halal-tour" | "korporat" | "general";
export type LeadStatus = "new" | "read" | "responded" | "closed";
export type CorpStatus = "new" | "read" | "responded" | "quoted" | "closed";
export type TravelType = "umroh" | "halal-tour" | "both";
export type AuditAction = "created" | "updated" | "deleted" | "login" | "logout";
export type Department = "Operations" | "Marketing" | "Customer Service" | "Finance" | "Management";

export type HeroPageKey =
  | "home"
  | "paket-umroh"
  | "korporat"
  | "destinasi"
  | "tentang-kami"
  | "kontak"
  | "tim"
  | "privacy"
  | "terms";

export type HeroMediaType = "image" | "youtube" | "video";

export interface HeroAppearance {
  image_url: string | null;
  background_color: string;
  /** Home hero media mode. Other pages currently use image. */
  media_type?: HeroMediaType;
  /** YouTube URL/ID or direct .mp4/.webm file URL. */
  video_url?: string | null;
}

export type HeroSettings = Partial<Record<HeroPageKey, HeroAppearance>>;

export interface SiteSetting {
  id: number;
  phone_display: string;
  whatsapp_number: string;
  office_address: string;
  cs_name: string;
  ppiu_license: string;
  maps_embed_url: string | null;
  /** Color brand logo for scrolled header + footer. Null = default. */
  logo_url: string | null;
  /** White brand logo for unscrolled header. Null = default. */
  logo_white_url: string | null;
  hero_settings: HeroSettings;
  updated_at: string;
  updated_by: number | null;
}

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: AdminRole;
  is_active: boolean;
  last_login_at: string | null;
  login_fail_count: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type AdminUserPublic = Omit<AdminUser, "password_hash" | "login_fail_count" | "locked_until">;

export interface AuditLog {
  id: number;
  admin_user_id: number | null;
  action: AuditAction;
  entity_type: string;
  entity_id: number | null;
  changed_fields: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Package {
  id: number;
  slug: string;
  name: string;
  category: PackageCategory;
  tag_line: string | null;
  /** Short summary shown under the package title. */
  description: string | null;
  /** Long details (pricing, hotels, include/exclude). */
  detail_text: string | null;
  hotel_distance_m: number | null;
  flight_type: string | null;
  price_mode: PriceMode;
  price_idr: number | null;
  price_display_text: string | null;
  cover_image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
}

export interface DepartureSchedule {
  id: number;
  package_id: number;
  departure_date: string;
  return_date: string;
  departure_city: string;
  airline: string | null;
  total_seats: number;
  seats_remaining: number;
  price_override_idr: number | null;
  status: ScheduleStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
}

export interface DepartureScheduleWithPackage extends DepartureSchedule {
  package_name: string;
  package_category: PackageCategory;
}

export interface HalalDestination {
  id: number;
  country_name: string;
  flag_emoji: string | null;
  badge_label: string | null;
  description: string | null;
  duration_text: string | null;
  best_season: string | null;
  starting_price_text: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
}

export interface HalalPackage {
  id: number;
  destination_id: number;
  name: string;
  tag_line: string | null;
  is_featured: boolean;
  seats_remaining: number | null;
  meta_chips: string[];
  highlights_text: string | null;
  price_display_text: string | null;
  price_idr: number | null;
  cover_image_url: string | null;
  departure_month: string | null;
  departure_date: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
}

export interface Testimonial {
  id: number;
  full_name: string;
  initials: string;
  city_or_role: string | null;
  package_name: string | null;
  star_rating: number;
  quote_text: string;
  page_context: PageContext;
  date_collected: string | null;
  is_verified: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: FaqCategory;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
}

export interface GalleryItem {
  id: number;
  image_url: string;
  thumbnail_url: string | null;
  alt_text: string;
  caption: string | null;
  category: GalleryCategory;
  file_size_kb: number | null;
  width_px: number | null;
  height_px: number | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
}

export interface TeamMember {
  id: number;
  full_name: string;
  role_title: string;
  department: Department;
  photo_url: string | null;
  bio: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
}

export interface ContactLead {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string;
  page_source: string | null;
  status: LeadStatus;
  agent_notes: string | null;
  assigned_to: number | null;
  responded_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CorporateInquiry {
  id: number;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string | null;
  estimated_pax: number | null;
  travel_type: TravelType;
  preferred_date: string | null;
  notes: string | null;
  status: CorpStatus;
  agent_notes: string | null;
  assigned_to: number | null;
  quoted_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
}
