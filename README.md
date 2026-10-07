# X-GenAI website

This repo is a short tour of how we built [x-genai.com](https://x-genai.com), the marketing site for X-GenAI (custom AI agents and workflow automation, built in Amsterdam, working worldwide).

It is **not** the full source. The production code lives in a private repo alongside client and business material. What's here is the interesting part: the decisions, how each page works, a handful of real source files worth reading, and the issue tracker we used to plan and ship it.

If you're evaluating the work, a good 15 minute path is:

1. Open the live site and click around.
2. Read [docs/pages.md](docs/pages.md) to see what each page is doing and why.
3. Skim [docs/engineering-notes.md](docs/engineering-notes.md) for the tricky bits.
4. Look at the [Issues tab](../../issues) (start with the Map issue) to see how the work was planned, decided and closed out.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components), React 19 |
| Styling | Tailwind CSS v4 with CSS custom-property design tokens |
| Fonts | `next/font/google`: Sora (display), DM Sans (body), Geist Mono (small functional bits) |
| Hosting | Vercel, apex domain on Cloudflare DNS |
| Analytics | Vercel Analytics (cookie-less, always on) plus Google Analytics only after opt-in consent |
| Booking | Cal.com link for a 15 minute intro call |
| Tests | Vitest for route-integrity checks |
| Backend | None. The site is fully static on purpose; forms degrade to `mailto:` with a copy fallback |

## What's in the site

```
app/
  page.tsx                  Home
  services/                 The five-stage engagement ladder, engineering practices, evals, tech stack
  proof/                    A real, runnable enquiry-to-CRM demo with verbatim output
  workflows/
    onboarding-agent/       Walkthrough of the onboarding agent demo
    client-reporting/       Walkthrough of the client-reporting demo
  about/  amsterdam/  contact/
  blog/  blog/[slug]/       Statically generated posts from a typed content file
  privacy/  terms/  cookies/
  opengraph-image.tsx       Code-generated social preview image
  sitemap.ts  robots.ts
components/                 ~40 components, most of them motion or showcase pieces
lib/                        Posts, UTM capture, shared route constants (+ tests)
```

## Highlights

- **Motion that never hides content.** Every reveal animation goes through one hook (`useReveal`) that resolves to visible under reduced motion, has a timeout backstop for when the browser pauses `requestAnimationFrame`, and a `<noscript>` rule so the page is fully readable with JavaScript off. See [code/components/reveal.tsx](code/components/reveal.tsx).
- **Performance tuned on real mobile, not just desktop.** We dropped blur-filter animations, promoted the ambient background to GPU layers with `will-change`, and kept transitions to transform and opacity only.
- **Honest visuals.** Every illustrative diagram on the site is labeled as illustrative. The one claim of "this actually runs" (`/proof`) shows output copied from a real run, including the failures.
- **Consent done properly.** Cookie-less analytics by default, Google Analytics loads only after an explicit "Allow", and withdrawing consent clears GA cookies on the spot.
- **Lead attribution without a backend.** UTM tags from the landing URL are kept for the session and stamped into the contact email, so we know which channel a lead came from.
- **Forms that can't silently fail.** `mailto:` gives no success signal, so after submit the form always shows the exact message with a copy button.
- **SEO basics wired in code.** Per-page metadata and canonicals, a generated sitemap and robots file, and an Open Graph image rendered from JSX.
- **Small tests where they pay off.** A Vitest suite checks that every workflow route constant points at a real page, so a typo can't ship a dead link.

## Docs

- [docs/pages.md](docs/pages.md): what each page does, section by section
- [docs/design-and-motion.md](docs/design-and-motion.md): tokens, type, and the motion system
- [docs/engineering-notes.md](docs/engineering-notes.md): consent, attribution, lead path, SEO, testing
- [docs/how-we-work.md](docs/how-we-work.md): the issue tracker ("wayfinder") and how work moves through it
- [code/README.md](code/README.md): the source files included here and why each one is worth a look

## How the work was tracked

Planning and delivery ran through GitHub Issues using a lightweight convention we call **wayfinder**. One `map` issue holds the destination and an index of everything else; `grilling` issues are decisions; `research` issues gather facts; `prototype` and `task` issues are build work. Each issue closes with a resolution comment saying what was decided or shipped.

The issues in this repo mirror the website-related tickets from the private tracker, trimmed to the website build. Details in [docs/how-we-work.md](docs/how-we-work.md).

## Running it

This repo is documentation plus excerpts, so it doesn't build on its own. The files under `code/` are copied unchanged from the production repo (comments included) so you can read them in context.
