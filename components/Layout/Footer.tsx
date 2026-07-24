import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { DEFAULT_LOGO_COLOR_URL } from "@/lib/brand";

interface FooterProps {
  settings: {
    office_address: string;
    phone_display: string;
    ppiu_license: string;
    /** Color logo for footer and non-header sections. */
    logo_url?: string;
  };
}

export function Footer({ settings }: FooterProps) {
  const logoUrl = settings.logo_url || DEFAULT_LOGO_COLOR_URL;

  return (
    <footer>
      <div className="container">
        <div className="footer-g">
          <div>
            <Link href="/" className="f-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="SS Umroh Logo" />
            </Link>
            <p className="f-desc">
              PT. Sarana Sadaya (SS Umroh) adalah biro perjalanan ibadah umroh dan haji khusus resmi berizin Kemenag RI. Kami berkomitmen memberikan pelayanan terbaik untuk kelancaran ibadah Anda.
            </p>
            <div className="f-ci">
              <MapPin size={16} className="mt-1 flex-shrink-0" />
              <span>{settings.office_address}</span>
            </div>
            <div className="f-ci">
              <Phone size={16} className="mt-1 flex-shrink-0" />
              <span>{settings.phone_display}</span>
            </div>
          </div>

          <div>
            <h4 className="f-col-t">Layanan</h4>
            <Link href="/paket-umroh" className="f-link">Umroh Reguler</Link>
            <Link href="/paket-umroh" className="f-link">Umroh Plus</Link>
            <Link href="/korporat" className="f-link">Corporate Travel</Link>
          </div>

          <div>
            <h4 className="f-col-t">Perusahaan</h4>
            <Link href="/tentang-kami" className="f-link">Tentang Kami</Link>
            <Link href="/tim" className="f-link">Tim Manajemen</Link>
            <Link href="/galeri" className="f-link">Galeri Keberangkatan</Link>
            <Link href="/kontak" className="f-link">Kontak & Lokasi</Link>
          </div>

          <div>
            <h4 className="f-col-t">Ikuti Kami</h4>
            <div className="flex gap-2">
              <a
                href="https://www.instagram.com/ssumrohofficial/"
                target="_blank"
                rel="noreferrer"
                className="f-soc"
                aria-label="Instagram SS Umroh"
              >
                <FaInstagram size={16} />
              </a>
              <a href="#" className="f-soc" aria-label="Facebook"><FaFacebook size={16} /></a>
              <a
                href="https://www.youtube.com/@SSUMROH"
                target="_blank"
                rel="noreferrer"
                className="f-soc"
                aria-label="YouTube SS Umroh"
              >
                <FaYoutube size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="f-bottom">
          <div className="f-copy">
            &copy; {new Date().getFullYear()} PT. Sarana Sadaya (SS Umroh). {settings.ppiu_license}.
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="f-legal-link">Kebijakan Privasi</Link>
            <Link href="/terms" className="f-legal-link">Syarat &amp; Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
