"use client";

/**
 * AnimatedCounter — Client Component
 * Animates a numeric statistic once when it enters the viewport.
 * The final value is rendered on the server for useful no-JavaScript HTML.
 */

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

const formatter = new Intl.NumberFormat("id-ID");

export function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 1600,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(target);

  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frameId = 0;
    let startTime = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setValue(0);
        const animate = (time: number) => {
          if (!startTime) startTime = time;
          const progress = Math.min((time - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(target * eased));

          if (progress < 1) {
            frameId = requestAnimationFrame(animate);
          }
        };

        frameId = requestAnimationFrame(animate);
        observer.disconnect();
      },
      { threshold: 0.6 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [duration, target]);

  return (
    <span ref={ref}>
      {prefix}
      {formatter.format(value)}
      {suffix}
    </span>
  );
}
