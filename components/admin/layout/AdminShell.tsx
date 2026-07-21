"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ToastProvider } from "@/components/admin/ui/Toast";
import type { AdminRole } from "@/types/db";

interface AdminShellProps {
  children: React.ReactNode;
  role: AdminRole;
  fullName: string;
  newLeadsCount?: number;
}

export function AdminShell({ children, role, fullName, newLeadsCount }: AdminShellProps) {
  return (
    <ToastProvider>
      <div className="admin-root">
        <Sidebar role={role} fullName={fullName} newLeadsCount={newLeadsCount} />
        <div className="admin-main">
          <Topbar />
          <main className="admin-content">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
