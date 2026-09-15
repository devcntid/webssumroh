import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ensureNextAuthUrl } from "@/lib/auth-url";

ensureNextAuthUrl();

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
