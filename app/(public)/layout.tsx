import { Nav } from "@/components/Layout/Nav";
import { Footer } from "@/components/Layout/Footer";
import { WABtn } from "@/components/Layout/WABtn";
import { resolveLogoColorUrl, resolveLogoWhiteUrl } from "@/lib/brand";
import { getSiteSettings } from "@/lib/queries/site-settings";

// Public pages are statically rendered and revalidated on an interval (ISR).
// Combined with the Redis data cache in lib/queries/*, this avoids hitting Neon
// on every request. Admin writes still invalidate the Redis keys for freshness.
export const revalidate = 300;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;
  try {
    settings = await getSiteSettings();
  } catch {
    settings = null;
  }

  const logoColorUrl = resolveLogoColorUrl(settings?.logo_url);
  const logoWhiteUrl = resolveLogoWhiteUrl(settings?.logo_white_url);
  const safeSettings = {
    office_address: settings?.office_address || "Jl. Cihapit No. 41, Kota Bandung",
    phone_display: settings?.phone_display || "0813-1201-7883",
    ppiu_license: settings?.ppiu_license || "SK PPIU No. U.108 Tahun 2021",
    whatsapp_number: settings?.whatsapp_number || "6281312017883",
    logo_url: logoColorUrl,
  };

  return (
    <>
      <Nav logoColorUrl={logoColorUrl} logoWhiteUrl={logoWhiteUrl} />
      <main>{children}</main>
      <Footer settings={safeSettings} />
      <WABtn
        settings={{
          wa: safeSettings.whatsapp_number,
          phone_display: safeSettings.phone_display,
        }}
      />
    </>
  );
}
