import type { DefaultSession } from "next-auth";
import type { AdminRole } from "@/types/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      role: AdminRole;
      fullName: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    role: AdminRole;
    fullName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: number;
    role?: AdminRole;
    fullName?: string;
  }
}
