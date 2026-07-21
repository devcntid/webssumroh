"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Settings, Package, Calendar, Globe, Map, Star,
  HelpCircle, Image, Users, Mail, Building2, UserCog, ClipboardList,
  ChevronRight, LogOut,
} from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { navForRole } from "@/lib/admin-nav";
import type { AdminRole } from "@/types/db";

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  dashboard: LayoutDashboard,
  settings: Settings,
  packages: Package,
  schedules: Calendar,
  "halal-dest": Globe,
  "halal-pkgs": Map,
  testimonials: Star,
  faqs: HelpCircle,
  gallery: Image,
  team: Users,
  leads: Mail,
  corporate: Building2,
  users: UserCog,
  audit: ClipboardList,
};

interface SidebarProps {
  role: AdminRole;
  fullName: string;
  newLeadsCount?: number;
}

export function Sidebar({ role, fullName, newLeadsCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const items = navForRole(role);
  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function isActive(href: string) {
    if (href === "/panel") return pathname === "/panel";
    return pathname.startsWith(href);
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <strong>SS Umroh</strong>
        <span>Admin Panel v1.0</span>
      </div>
      <nav className="admin-nav" aria-label="Admin modules">
        {items.map((item) => {
          const Icon = ICONS[item.id] || LayoutDashboard;
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`admin-nav-item ${active ? "active" : ""}`}
            >
              <Icon size={14} />
              <span className="label" style={{ flex: 1 }}>{item.label}</span>
              {item.id === "leads" && newLeadsCount > 0 && (
                <span className="admin-nav-badge">{newLeadsCount}</span>
              )}
              {active && <ChevronRight size={11} color="#D4A017" />}
            </Link>
          );
        })}
      </nav>
      <div className="admin-sidebar-user">
        <div className="admin-avatar">{initials}</div>
        <div className="meta" style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.8)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {fullName}
          </div>
          <Badge color="pink">{role}</Badge>
        </div>
        <button
          type="button"
          className="admin-nav-item"
          onClick={() => signOut({ callbackUrl: "/panel/login" })}
          title="Keluar"
          aria-label="Keluar"
          style={{
            width: "auto",
            margin: 0,
            padding: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,.7)",
          }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}
