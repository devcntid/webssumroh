"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface FAQListItem {
  id: number;
  question: string;
  answer: string;
}

export function FAQList({ faqs }: { faqs: FAQListItem[] }) {
  const [openId, setOpenId] = useState<number | null>(
    faqs.length > 0 ? faqs[faqs.length - 1].id : null
  );

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="acc-list">
      {faqs.map((faq) => (
        <div key={faq.id} className={`acc-item ${openId === faq.id ? "open" : ""}`}>
          <button
            type="button"
            className="acc-btn"
            onClick={() => toggle(faq.id)}
            aria-expanded={openId === faq.id}
            aria-controls={`faq-answer-${faq.id}`}
          >
            <span className="acc-q">{faq.question}</span>
            <span className="acc-ico" aria-hidden><Plus size={14} /></span>
          </button>
          <div id={`faq-answer-${faq.id}`} className="acc-body">
            {faq.answer}
          </div>
        </div>
      ))}
    </div>
  );
}
