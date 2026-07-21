import { SessionProvider } from "@/components/admin/providers/SessionProvider";

export const dynamic = "force-dynamic";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
