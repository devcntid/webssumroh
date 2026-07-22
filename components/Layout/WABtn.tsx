"use client";

import { MessageCircle, Phone } from "lucide-react";

interface WABtnProps {
  settings: {
    wa: string;
    phone_display: string;
  };
}

export function WABtn({ settings }: WABtnProps) {
  const waUrl = `https://wa.me/${settings.wa}?text=Assalamu%27alaikum%20SS%20Umroh%2C%20saya%20ingin%20konsultasi%20paket%20umroh.`;

  return (
    <>
      {/* Desktop floating WA — hidden on mobile via CSS */}
      <div className="wa-wrap">
        <div className="wa-lbl">Konsultasi Gratis</div>
        <a href={waUrl} target="_blank" rel="noreferrer" className="wa-btn" aria-label="WhatsApp">
          <MessageCircle size={28} />
        </a>
      </div>

      {/* Mobile sticky bar — shown only below 768px via CSS */}
      <div className="mob-bar">
        <a href={`tel:${settings.wa}`} className="mob-tel">
          <Phone size={14} /> {settings.phone_display}
        </a>
        <a href={waUrl} target="_blank" rel="noreferrer" className="mob-wa-btn">
          <MessageCircle size={16} /> Chat WhatsApp
        </a>
      </div>
    </>
  );
}
