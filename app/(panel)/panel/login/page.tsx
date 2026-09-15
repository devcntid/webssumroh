"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * Admin login — Google SSO only.
 * Only emails present in admin_users may sign in (enforced in NextAuth signIn callback).
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  const errorMessage = useMemo(() => {
    const error = searchParams.get("error");
    if (!error) return null;
    if (error === "AccessDenied") {
      return "Email Google Anda belum terdaftar sebagai admin, atau akun nonaktif.";
    }
    if (error === "OAuthAccountNotLinked") {
      return "Email Google Anda belum terdaftar sebagai admin.";
    }
    if (error === "OAuthCallback" || error === "Callback" || error === "OAuthSignin") {
      return "Gagal menyelesaikan login Google. Pastikan NEXTAUTH_URL dan redirect URI Google mengarah ke domain produksi, lalu coba lagi.";
    }
    if (error === "Configuration") {
      return "Konfigurasi login belum lengkap. Periksa GOOGLE_CLIENT_ID / SECRET dan NEXTAUTH_SECRET.";
    }
    return "Gagal masuk. Silakan coba lagi.";
  }, [searchParams]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/panel");
    }
  }, [status, router]);

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/panel" });
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <div className="admin-login-logo">SS</div>
          <div>
            <h1>SS Umroh</h1>
            <p>Admin Panel</p>
          </div>
        </div>

        <p style={{ margin: "0 0 20px", fontSize: 14, color: "#5c5668", lineHeight: 1.5 }}>
          Masuk dengan akun Google yang sudah terdaftar di sistem.
          Tidak ada registrasi mandiri.
        </p>

        {errorMessage && (
          <div
            role="alert"
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 10,
              background: "#FEE2E2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          className="admin-btn primary"
          onClick={handleGoogleSignIn}
          disabled={loading || status === "loading" || status === "authenticated"}
          style={{
            width: "100%",
            justifyContent: "center",
            gap: 10,
            padding: "12px 16px",
            fontSize: 14,
          }}
        >
          <GoogleIcon />
          {loading ? "Mengalihkan…" : "Masuk dengan Google"}
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.2 7.9 3.1l5.7-5.7C34 5.1 29.3 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21 21-9.3 21-21c0-1.4-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3 0 5.8 1.2 7.9 3.1l5.7-5.7C34 5.1 29.3 3 24 3 16.1 3 9.2 7.5 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.3 26.7 37 24 37c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.1 40.4 16 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.1 7.1l.1.1 6.2 5.2C37.2 39.2 45 33 45 24c0-1.4-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-login">
          <div className="admin-login-card">Memuat…</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
