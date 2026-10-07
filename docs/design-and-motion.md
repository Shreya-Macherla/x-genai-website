# Design and motion

## Tokens

All colors are CSS custom properties on `:root` in `app/globals.css`, then exposed to Tailwind v4 through `@theme inline`. Components only ever use the semantic names (`bg-surface`, `text-muted`, `border-line`, `text-accent-dim`), never raw hex, which is what let us re-theme the whole site in one file.

| Token | Role |
|---|---|
| `--background`, `--surface`, `--surface-2` | Page and card layers |
| `--foreground`, `--muted` | Body and secondary text |
| `--accent`, `--accent-dim` | Violet accent for CTAs, links and highlights |
| `--sage`, `--sun` | Secondary accents (cyan, amber) used sparingly |
| `--ink*` | The darker "console" panels |
| `--shadow-rgb`, `--accent-rgb` | Bare RGB channels so shadows and glows can take an alpha |
| `--ease-premium` | The single easing curve used everywhere: `cubic-bezier(0.16, 1, 0.3, 1)` |

The Open Graph image can't import CSS, so it repeats the brand hex values with a comment pointing back to the tokens.

## Type

- **Sora** for headings, set with slight negative tracking.
- **DM Sans** for body text.
- **Geist Mono** only for small functional details: eyebrow labels, nav, terminal-style prompts like `$ ls services/`. A trace of the engineer under the warmth, not a code-themed site.

## Voice

Direct and concrete by default, warmer when describing the reader's pain, and occasionally opinionated about real engineering versus demo-ware. No buzzwords, no em dashes, nothing that reads machine-written. Copy goes through a pass for exactly that.

## Motion system

One primitive, `useReveal` (see [code/components/reveal.tsx](../code/components/reveal.tsx)), drives almost every animation:

- `mode: "mount"` reveals shortly after first paint (hero content).
- `mode: "scroll"` reveals once when the element enters the viewport (`IntersectionObserver`, then disconnect).
- Under `prefers-reduced-motion` it resolves to visible straight away. This hook controls visibility, not just decoration, so reduced motion must never leave content stuck hidden.

Rules we landed on after testing on real phones:

- **Transform and opacity only.** We originally blurred elements in. Animating `filter: blur()` repaints every frame and was visibly janky on mid-range mobile, so it went.
- **700ms, with tight staggers.** The hero now settles about 1 second after mount instead of 1.5.
- **One bold moment.** The masked word-by-word headline is reserved for the hero.
- **Scroll-driven decks get hold zones.** The services stage stack splits the scroll track into "hold" and "move" segments so you can read a card before the next one slides over it, and crossfades use a steep opacity falloff so two cards never sit at 50% on top of each other.
- **Ambient background is cheap.** Three slow drifting blurred blobs, each on its own GPU layer via `will-change: transform`, muted under reduced motion.
- **Page transitions.** React's `<ViewTransition>` needs a canary build and we pin stable React, so `page-transition.tsx` is a small dependency-free fade-in keyed on the pathname.

Small tactile details live as reusable classes: `.btn-press` (spring press), `.hover-lift` (shadow and border on hover, leaves `transform` to Tailwind so it composes), `.glow-hover` (reserved for primary CTAs), and `.highlight` (a marker-pen sweep behind a word that starts fully painted, so it never depends on JS to be legible).
