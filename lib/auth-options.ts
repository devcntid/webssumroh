import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { findAdminByEmail, recordLoginSuccess } from "@/lib/queries/admin-users";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import { ensureNextAuthUrl } from "@/lib/auth-url";
import type { AdminRole } from "@/types/db";

export const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

ensureNextAuthUrl();

async function resolveActiveAdmin(email: string) {
  const admin = await findAdminByEmail(email.trim());
  if (!admin || !admin.is_active || admin.deleted_at) return null;
  return admin;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: SESSION_TTL_SECONDS,
  },
  pages: {
    signIn: "/panel/login",
    error: "/panel/login",
  },
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.trim();
      if (!email) return false;

      try {
        const admin = await resolveActiveAdmin(email);
        return Boolean(admin);
      } catch (error) {
        console.error("[auth] signIn lookup failed", error);
        // Returning false → AccessDenied (clearer than OAuthCallback from a throw)
        return false;
      }
    },

    async redirect({ url, baseUrl }) {
      // Keep admins inside /panel after Google SSO.
      if (url.startsWith("/")) {
        return `${baseUrl}${url.startsWith("/panel") ? url : "/panel"}`;
      }
      try {
        const target = new URL(url);
        if (target.origin === baseUrl) {
          return target.pathname.startsWith("/panel") ? url : `${baseUrl}/panel`;
        }
      } catch {
        // fall through
      }
      return `${baseUrl}/panel`;
    },

    async jwt({ token, user, account }) {
      // On initial Google sign-in, embed admin_users fields into the JWT.
      // Never throw here — throws become ?error=OAuthCallback in production.
      if (account && user?.email) {
        try {
          const admin = await resolveActiveAdmin(user.email);
          if (!admin) {
            return token;
          }

          token.userId = admin.id;
          token.role = admin.role as AdminRole;
          token.fullName = admin.full_name;
          token.email = admin.email;

          try {
            await recordLoginSuccess(admin.id);
            await writeAuditLog({
              admin_user_id: admin.id,
              action: "login",
              entity_type: "admin_users",
              entity_id: admin.id,
              changed_fields: { method: "google_sso" },
            });
          } catch (sideEffectError) {
            // Login must succeed even if audit/side effects fail.
            console.error("[auth] login side-effect failed", sideEffectError);
          }
        } catch (error) {
          console.error("[auth] jwt enrichment failed", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.userId && token.role) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.fullName = token.fullName ?? "";
        session.user.email = token.email ?? session.user.email;
        session.user.name = token.fullName ?? session.user.name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
