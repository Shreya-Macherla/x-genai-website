"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Core motion primitive for the site. `mode: "mount"` fires shortly after
 * first paint (for above-the-fold content); `mode: "scroll"` fires once,
 * the first time the element enters the viewport. Always resolves to
 * `shown: true` immediately under prefers-reduced-motion, this drives
 * visibility, not just a nice-to-have animation, so reduced motion must
 * never leave content stuck invisible.
 *
 * Ticket #40 (2026-09-17): duration trimmed from 1000ms to 700ms, with
 * staggered delays across a section (a common pattern here), the old
 * duration made the last element in a group settle nearly a second and a
 * half after the first, which read as sluggish rather than premium.
 *
 * Ticket #40 follow-up (owner feedback: still feels rough on mobile):
 * dropped the blur-filter animation entirely rather than just shrinking it.
 * Animating `filter: blur()` forces the browser to repaint the blur every
 * frame instead of just compositing a transform, cheap on a fast desktop
 * GPU, visibly janky on mid-range mobile, especially with several reveals
 * staggering in at once (a services grid, a card row). Transform + opacity
 * alone is what every reliably-smooth site animation is actually built
 * from; this is the shared primitive almost every reveal on the site goes
 * through, so the fix lands everywhere at once.
 */
export function useReveal<T extends Element = HTMLDivElement>(opts?: {
  mode?: "scroll" | "mount";
  threshold?: number;
}) {
  const mode = opts?.mode ?? "scroll";
  const threshold = opts?.threshold ?? 0.15;
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Wrapped in a microtask rather than called synchronously here, so
      // this doesn't trigger a same-commit cascading render.
      queueMicrotask(() => setShown(true));
      return;
    }
    if (mode === "mount") {
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setShown(true)),
      );
      // Defensive backstop: Chrome (confirmed via live testing) and
      // likely other engines fully suspend requestAnimationFrame while
      // `document.hidden` is true. If first paint happens in a
      // backgrounded tab, or rAF is blocked/delayed for any other
      // reason, the double rAF above never fires and this content would
      // otherwise stay invisible forever. Force the revealed state after
      // a short delay regardless of whether rAF ever ran; harmless if it
      // already did, since setShown(true) on an already-true state is a
      // no-op re-render.
      const timeout = setTimeout(() => setShown(true), 1000);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timeout);
      };
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode, threshold]);

  return { ref, shown };
}

/** Wrapper version of useReveal for simple, non-grid blocks (headers, paragraphs). */
export function Reveal({
  children,
  delay = 0,
  className = "",
  mode = "scroll",
  id,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  mode?: "scroll" | "mount";
  id?: string;
}) {
  const { ref, shown } = useReveal({ mode });
  return (
    <div
      ref={ref}
      id={id}
      data-reveal
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[transform,opacity] duration-700 ease-[var(--ease-premium)] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
