"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from "react";

export type WorkingStage = { step: string; name: string; desc: string };

const MAX_TILT = 7; // degrees, subtle, matches the site's restrained motion

/** Continuous keyframes the deck interpolates between as `diff` (a card's
 * position relative to the scroll-driven active point) sweeps through real
 * numbers, not just integers, this is what makes the deck move smoothly
 * with the scrollbar instead of snapping card to card. */
const STOPS = [
  { d: -1.4, tx: -520, ty: 0, rot: -10, scale: 1, opacity: 0 },
  { d: -1, tx: -380, ty: 0, rot: -8, scale: 1, opacity: 0 },
  { d: 0, tx: 0, ty: 0, rot: 0, scale: 1, opacity: 1 },
  { d: 1, tx: 26, ty: 30, rot: 2.5, scale: 0.96, opacity: 0.9 },
  { d: 2, tx: 44, ty: 52, rot: 4.5, scale: 0.92, opacity: 0.5 },
  { d: 2.6, tx: 60, ty: 72, rot: 6, scale: 0.88, opacity: 0 },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function styleForDiff(diff: number) {
  const d = Math.min(STOPS[STOPS.length - 1].d, Math.max(STOPS[0].d, diff));
  let lo = STOPS[0];
  let hi = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (d >= STOPS[i].d && d <= STOPS[i + 1].d) {
      lo = STOPS[i];
      hi = STOPS[i + 1];
      break;
    }
  }
  const t = hi.d === lo.d ? 0 : (d - lo.d) / (hi.d - lo.d);
  return {
    tx: lerp(lo.tx, hi.tx, t),
    ty: lerp(lo.ty, hi.ty, t),
    rot: lerp(lo.rot, hi.rot, t),
    scale: lerp(lo.scale, hi.scale, t),
    opacity: lerp(lo.opacity, hi.opacity, t),
  };
}

/**
 * "Working together" as a scroll-driven deck: the section pins in place
 * for a stretch of scroll, and the stages page front-to-back one after
 * another as the visitor scrolls through that range: forward to advance,
 * backward to reverse. Arrows, dots, and the keyboard all just scroll the
 * page to the matching point rather than jumping state directly, so every
 * control stays consistent with scroll being what actually drives it. The
 * stack also tilts toward the cursor while it's pinned in view.
 */
export function WorkingTogetherDeck({ steps }: { steps: WorkingStage[] }) {
  const [activeFloat, setActiveFloat] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const trackRef = useRef<HTMLDivElement>(null);
  const count = steps.length;
  const maxIndex = Math.max(count - 1, 1);

  useEffect(() => {
    // Deferred to a microtask rather than called synchronously here, so
    // this doesn't trigger a same-commit cascading render (see reveal.tsx).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      queueMicrotask(() => setReducedMotion(true));
    }
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    function update() {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      setActiveFloat(progress * maxIndex);
    }
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion, maxIndex]);

  function scrollToIndex(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const target = Math.min(count - 1, Math.max(0, i));
    const rect = el.getBoundingClientRect();
    const docTop = rect.top + window.scrollY;
    const total = Math.max(rect.height - window.innerHeight, 0);
    window.scrollTo({
      top: docTop + (target / maxIndex) * total,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  function go(delta: number) {
    scrollToIndex(Math.round(activeFloat) + delta);
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  }

  function onSectionMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -ny * 2 * MAX_TILT, y: nx * 2 * MAX_TILT });
  }
  function onSectionMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  const active = Math.round(activeFloat);

  // Scroll-jacking a whole page section is itself a large motion effect,
  // for reduced motion, skip the pin/hijack entirely rather than just
  // softening the transition curve, and fall back to a plain stacked list.
  if (reducedMotion) {
    return (
      <div className="mt-10 space-y-4">
        {steps.map((s) => (
          <div
            key={s.name}
            className="rounded-2xl border border-line bg-surface p-7 shadow-[0_12px_30px_-18px_rgb(var(--shadow-rgb)/0.2)]"
          >
            <p className="font-mono text-xs uppercase tracking-wider text-accent-dim">
              {s.step}
            </p>
            <h3 className="mt-3 text-xl">{s.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{s.desc}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={trackRef} className="relative mt-10" style={{ height: `${maxIndex * 70}vh` }}>
      <div
        onMouseMove={onSectionMouseMove}
        onMouseLeave={onSectionMouseLeave}
        className="sticky top-24 flex min-h-[65vh] flex-col items-center justify-center"
      >
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Working together, stage by stage"
          tabIndex={0}
          onKeyDown={onKeyDown}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.3s ease-out",
          }}
          className="relative mx-auto h-[42vh] max-h-[420px] min-h-[300px] w-full max-w-lg focus:outline-none sm:max-w-xl"
        >
          {steps.map((s, i) => {
            const diff = i - activeFloat;
            const { tx, ty, rot, scale, opacity } = styleForDiff(diff);
            const isFront = Math.abs(diff) < 0.5;
            return (
              <div
                key={s.name}
                aria-hidden={!isFront}
                inert={!isFront ? true : undefined}
                style={{
                  transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
                  opacity,
                  zIndex: Math.round(100 - Math.abs(diff) * 10),
                }}
                className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-7 shadow-[0_12px_30px_-18px_rgb(var(--shadow-rgb)/0.2)] sm:p-9"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-5 top-4 select-none font-display text-5xl leading-none text-line/50 sm:right-6 sm:top-5 sm:text-6xl"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative max-w-[70%]">
                  <p className="font-mono text-xs uppercase tracking-wider text-accent-dim">
                    {s.step}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {s.name}
                  </h3>
                </div>
                <p className="relative max-w-md text-sm leading-relaxed text-muted sm:text-base">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-7 flex items-center justify-center gap-5">
          <button
            type="button"
            aria-label="Previous stage"
            onClick={() => go(-1)}
            className="btn-press flex h-9 w-9 items-center justify-center rounded-full border border-line text-foreground transition-colors hover:border-accent"
          >
            <span aria-hidden>‹</span>
          </button>
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <button
                key={s.name}
                type="button"
                aria-label={`Go to ${s.name}`}
                aria-current={i === active}
                onClick={() => scrollToIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active ? "w-6 bg-accent-dim" : "w-2 bg-line hover:bg-muted"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next stage"
            onClick={() => go(1)}
            className="btn-press flex h-9 w-9 items-center justify-center rounded-full border border-line text-foreground transition-colors hover:border-accent"
          >
            <span aria-hidden>›</span>
          </button>
        </div>

        <p aria-live="polite" className="sr-only">
          {`Stage ${active + 1} of ${count}: ${steps[active].name}`}
        </p>
      </div>
    </div>
  );
}
