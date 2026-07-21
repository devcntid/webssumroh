"use client";

import { useEffect } from "react";

const REVEAL_VARIANTS = [
  "scroll-reveal--up",
  "scroll-reveal--left",
  "scroll-reveal--right",
  "scroll-reveal--scale",
  "scroll-reveal--fade",
] as const;

/**
 * Adds varied one-time reveal animations to every public-page section.
 * Classes are applied only after hydration, so content remains available
 * without JavaScript. Reduced-motion preferences are respected.
 */
export function ScrollReveal() {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > section")
    );

    if (
      sections.length === 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    sections.forEach((section, index) => {
      section.classList.add(
        "scroll-reveal",
        REVEAL_VARIANTS[index % REVEAL_VARIANTS.length]
      );

      const container = section.querySelector<HTMLElement>(":scope > .container");
      if (!container) return;

      Array.from(container.children)
        .slice(0, 8)
        .forEach((child, childIndex) => {
          if (!(child instanceof HTMLElement)) return;
          child.classList.add("scroll-reveal__item");
          child.style.setProperty(
            "--reveal-delay",
            `${Math.min(childIndex * 90, 450)}ms`
          );
        });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("scroll-reveal--visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return null;
}
