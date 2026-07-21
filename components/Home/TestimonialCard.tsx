import type { Testimonial } from "@/types/db";
import { Star } from "lucide-react";

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="t-card">
      <div className="flex gap-1 text-[#D4A017]">
        {Array.from({ length: t.star_rating }).map((_, i) => (
          <Star key={i} size={14} fill="currentColor" />
        ))}
      </div>
      <p className="t-quote">{t.quote_text}</p>
      <div className="t-author">
        <div className="t-av">{t.initials}</div>
        <div>
          <div className="t-name">{t.full_name}</div>
          <div className="t-meta">{t.city_or_role} • {t.package_name}</div>
        </div>
      </div>
    </div>
  );
}
