"use client";

/**
 * HomeHeroSlider — Client Component
 * Data source: site_settings.hero_settings.home.slides
 * CMS: /panel/settings (Site settings → Home hero slides)
 * Renders: Rotating title, description, and right-side image (1–3 slides)
 */

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { formatHeroTitle } from "@/lib/hero-settings";
import type { HeroSlide } from "@/types/db";

const AUTO_MS = 6500;

interface HomeHeroSliderProps {
  slides: HeroSlide[];
  eyebrow?: ReactNode;
  children?: ReactNode;
}

export function HomeHeroSlider({ slides, eyebrow, children }: HomeHeroSliderProps) {
  const safeSlides = slides.length > 0 ? slides.slice(0, 3) : [];
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animKey, setAnimKey] = useState(0);

  const count = safeSlides.length;
  const active = safeSlides[Math.min(index, Math.max(count - 1, 0))];

  useEffect(() => {
    if (count <= 1) return;
    const timer = window.setInterval(() => {
      setDirection("next");
      setIndex((current) => (current + 1) % count);
      setAnimKey((key) => key + 1);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [count]);

  function goTo(nextIndex: number) {
    if (nextIndex === index || count <= 1) return;
    const wrappingForward = index === count - 1 && nextIndex === 0;
    const wrappingBack = index === 0 && nextIndex === count - 1;
    setDirection(
      wrappingBack || (!wrappingForward && nextIndex < index) ? "prev" : "next"
    );
    setIndex(nextIndex);
    setAnimKey((key) => key + 1);
  }

  if (!active) return null;

  return (
    <div className="home-hero-layout">
      <div className="home-hero-copy">
        {eyebrow}

        <div
          key={`copy-${animKey}`}
          className={`home-hero-slide-copy home-hero-anim-${direction}`}
        >
          <h1 className="ph-h1">{formatHeroTitle(active.title)}</h1>
          <p className="ph-sub">{active.description}</p>
        </div>

        {count > 1 && (
          <div className="home-hero-dots" role="tablist" aria-label="Hero slides">
            {safeSlides.map((slide, slideIndex) => {
              const selected = slideIndex === index;
              return (
                <button
                  key={`${slide.title}-${slideIndex}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`Slide ${slideIndex + 1}`}
                  className={`home-hero-dot${selected ? " is-active" : ""}`}
                  onClick={() => goTo(slideIndex)}
                />
              );
            })}
          </div>
        )}

        {children}
      </div>

      <div className="home-hero-visual">
        <div
          key={`visual-${animKey}`}
          className={`home-hero-visual-frame home-hero-anim-${direction}`}
        >
          {active.image_url ? (
            <Image
              src={active.image_url}
              alt={active.title.replace(/\*/g, "")}
              fill
              priority={index === 0}
              sizes="(max-width: 900px) 88vw, 420px"
              className="home-hero-visual-img"
            />
          ) : (
            <div className="home-hero-visual-fallback" aria-hidden />
          )}
        </div>
      </div>
    </div>
  );
}
