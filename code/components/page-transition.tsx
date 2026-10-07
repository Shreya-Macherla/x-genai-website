"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Ticket #40 follow-up (owner feedback: still feels rough, the abrupt cut
 * between pages, not just reveal timing). React's own `<ViewTransition>`
 * would be the "correct" fix per Next's docs, but it needs a canary React
 * build: checked, this project pins stable react@19.2.8, where
 * `ViewTransition` isn't exported (confirmed via typecheck, not guessed).
 * Swapping to a canary React for a marketing site's animation polish isn't
 * a call to make unilaterally, so this is a plain, dependency-free fallback
 * instead: fade the incoming page in rather than have it appear instantly.
 *
 * Keyed on pathname so React remounts this wrapper on every navigation,
 * same double-rAF mount pattern used by useReveal's "mount" mode elsewhere,
 * so a fresh page starts at opacity-0 and fades to 1. It only smooths the
 * *entry*; Next unmounts the outgoing page instantly either way (a true
 * cross-fade would need the exit to persist during the transition, which
 * needs that same canary API). Reduced motion is handled for free by the
 * sitewide `prefers-reduced-motion` override in globals.css, which forces
 * every transition-duration near-zero.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <FadeIn key={pathname}>{children}</FadeIn>
  );
}

function FadeIn({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setVisible(true)),
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={`transition-opacity duration-300 ease-[var(--ease-premium)] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
