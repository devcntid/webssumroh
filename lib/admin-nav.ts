import type { AdminRole } from "@/types/db";

export interface NavItem {
  href: string;
  id: string;
  label: string;
  roles?: AdminRole[]; // if set, only these roles see it
  adminOnly?: boolean;
  hideForEditor?: boolean;
}

export const ADMIN_NAV: NavItem[] = [
  { href: "/panel", id: "dashboard", label: "Dashboard" },
  { href: "/panel/settings", id: "settings", label: "Site settings", roles: ["super_admin", "admin"] },
  { href: "/panel/packages", id: "packages", label: "Packages", roles: ["super_admin", "admin", "editor"] },
  { href: "/panel/schedules", id: "schedules", label: "Departure schedules", roles: ["super_admin", "admin", "editor"] },
  { href: "/panel/testimonials", id: "testimonials", label: "Testimonials", roles: ["super_admin", "admin", "editor"] },
  { href: "/panel/faqs", id: "faqs", label: "FAQ", roles: ["super_admin", "admin", "editor"] },
  { href: "/panel/gallery", id: "gallery", label: "Gallery", roles: ["super_admin", "admin", "editor"] },
  { href: "/panel/team", id: "team", label: "Team", roles: ["super_admin", "admin", "editor"] },
  { href: "/panel/leads", id: "leads", label: "Leads", roles: ["super_admin", "admin", "cs_agent"] },
  { href: "/panel/corporate", id: "corporate", label: "Corporate inquiries", roles: ["super_admin", "admin", "cs_agent"] },
  { href: "/panel/users", id: "users", label: "User management", roles: ["super_admin"] },
  { href: "/panel/audit", id: "audit", label: "Audit log", roles: ["super_admin", "admin"] },
];

export function navForRole(role: AdminRole): NavItem[] {
  return ADMIN_NAV.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });
}

export const PAGE_LABELS: Record<string, string> = Object.fromEntries(
  ADMIN_NAV.map((n) => [n.id, n.label])
);
