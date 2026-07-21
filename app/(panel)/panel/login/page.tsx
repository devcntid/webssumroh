import { redirect } from "next/navigation";
import { ADMIN_AUTH_BYPASS } from "@/lib/auth";

/**
 * Login page — redirects to panel while auth bypass is enabled.
 */
export default function AdminLoginPage() {
  if (ADMIN_AUTH_BYPASS) {
    redirect("/panel");
  }

  // Kept for when auth is re-enabled; client form lives below via dynamic import pattern.
  // For now always redirect above when bypass is on.
  redirect("/panel");
}
