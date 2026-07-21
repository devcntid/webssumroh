"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin-nav";

export function Topbar() {
  const pathname = usePathname();

  const current =
    ADMIN_NAV.find((n) =>
      n.href === "/panel" ? pathname === "/panel" : pathname.startsWith(n.href)
    )?.label || "Admin";

  return (
    <header className="admin-topbar">
      <div className="admin-breadcrumb">
        <span>Admin</span>
        <ChevronRight size={11} />
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{current}</span>
      </div>
    </header>
  );
}
