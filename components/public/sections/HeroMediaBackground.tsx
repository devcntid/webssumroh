/**
 * HeroMediaBackground — Client Component
 * Renders home hero media: static image, YouTube embed, or uploaded video file.
 * Image remains as CSS background / poster fallback via parent `.ph-bg`.
 */

"use client";

import { useEffect, useRef } from "react";
import {
  extractYoutubeId,
  youtubeBackgroundEmbedUrl,
} from "@/lib/hero-settings";
import type { HeroAppearance } from "@/types/db";

interface HeroMediaBackgroundProps {
  hero: HeroAppearance;
  /** Used for accessibility / poster when video is active. */
  posterAlt?: string;
}

export function HeroMediaBackground({
  hero,
  posterAlt = "Hero background",
}: HeroMediaBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaType = hero.media_type ?? "image";
  const youtubeId =
    mediaType === "youtube" ? extractYoutubeId(hero.video_url) : null;

  useEffect(() => {
    const el = videoRef.current;
    if (!el || mediaType !== "video") return;
    el.muted = true;
    const play = el.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {
        // Autoplay may be blocked; muted loop usually succeeds after user gesture.
      });
    }
  }, [mediaType, hero.video_url]);

  if (mediaType === "youtube" && youtubeId) {
    return (
      <div className="ph-video" aria-hidden>
        <iframe
          className="ph-video-frame"
          src={youtubeBackgroundEmbedUrl(youtubeId)}
          title={posterAlt}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={false}
          loading="lazy"
          tabIndex={-1}
        />
      </div>
    );
  }

  if (mediaType === "video" && hero.video_url) {
    return (
      <div className="ph-video" aria-hidden>
        <video
          ref={videoRef}
          className="ph-video-el"
          src={hero.video_url}
          poster={hero.image_url ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    );
  }

  return null;
}
