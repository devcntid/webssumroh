import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { findAdminByEmail, recordLoginSuccess } from "@/lib/queries/admin-users";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import type { AdminRole } from "@/types/db";

export const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

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

      const admin = await findAdminByEmail(email);
      if (!admin || !admin.is_active || admin.deleted_at) {
        // NextAuth redirects to pages.error with ?error=AccessDenied
        return false;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // On initial Google sign-in, embed admin_users fields into the JWT.
      if (account && user?.email) {
        const admin = await findAdminByEmail(user.email);
        if (!admin || !admin.is_active || admin.deleted_at) {
          throw new Error("AccessDenied");
        }

        token.userId = admin.id;
        token.role = admin.role as AdminRole;
        token.fullName = admin.full_name;
        token.email = admin.email;

        await recordLoginSuccess(admin.id);
        await writeAuditLog({
          admin_user_id: admin.id,
          action: "login",
          entity_type: "admin_users",
          entity_id: admin.id,
          changed_fields: { method: "google_sso" },
        });
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
};
