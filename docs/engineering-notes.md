# Engineering notes

The parts that took more thought than they look.

## 1. Content must survive animation failure

An external review noticed the hero sometimes loaded half-revealed. We tested three cases:

| Case | Result | Fix |
|---|---|---|
| `prefers-reduced-motion: reduce` | Pass | Already resolved to visible on mount |
| JavaScript disabled or failing before hydration | Fail: server HTML shipped with `opacity-0` baked in | Every gated element carries `data-reveal`; a `<noscript><style>` in the layout forces those back to visible. It sits in `<noscript>` so it can never fight the real animation when JS works |
| Tab opened in the background | Fail: Chrome suspends `requestAnimationFrame` while `document.hidden`, so the double-rAF mount reveal never fired | A 1 second `setTimeout` backstop next to the rAF; background timers are throttled, not suspended |

Files: [layout.tsx](../code/app/layout.tsx), [reveal.tsx](../code/components/reveal.tsx).

## 2. Consent-first analytics

- **Vercel Analytics** is cookie-less and runs for everyone.
- **Google Analytics** renders nothing unless the measurement ID env var exists *and* the visitor clicked "Allow". The banner writes the choice to `localStorage` and fires a window event; the GA component listens and loads or unloads.
- Withdrawing consent sets `analytics_storage: denied` and deletes `_ga*` cookies across the host variants immediately.
- **Click tracking** is one delegated listener for any element with `data-track="event_name"` (plus every `mailto:` link). Tagged buttons can stay in server components, no `"use client"` needed. `trackEvent` is a no-op without consent.

Files: [cookie-banner.tsx](../code/components/cookie-banner.tsx), [google-analytics.tsx](../code/components/google-analytics.tsx), [click-tracker.tsx](../code/components/click-tracker.tsx).

## 3. Lead attribution on a static site

No backend means no server-side attribution. Instead:

1. `UtmCapture` (mounted once in the root layout) reads `utm_source`, `utm_medium`, `utm_campaign` from the landing URL.
2. It writes them to `sessionStorage` only if the URL actually has them, so the original source survives a multi-page visit.
3. The contact form and newsletter signup append a `Source: ...` line to the email body.

We tested it end to end by landing with tagged params, submitting the form, and checking the generated message. Outbound links follow a documented tagging convention so the values stay consistent.

There's also a short-link rewrite in `next.config.ts` (`/ig` serves the homepage but keeps its own path) so channel traffic shows up as its own page in free analytics, without paying for UTM breakdowns. The canonical tag still points at `/`, so search engines don't see a duplicate.

Files: [utm.ts](../code/lib/utm.ts), [utm-capture.tsx](../code/components/utm-capture.tsx).

## 4. Forms that can't fail silently

The contact form builds a `mailto:` link. On a machine with no default mail client (common now with webmail), clicking submit does nothing visible and the lead is lost. So after submit, the form always shows the full message (to, subject, body) in a read-only box with a "Copy message" button, a retry link, and the raw address. Same pattern in the newsletter signup so the two stay consistent.

File: [contact-form.tsx](../code/components/contact-form.tsx).

## 5. SEO in code

- Root `metadata` with a title template, description, canonical, Open Graph and Twitter card. Each page overrides title, description and canonical.
- `app/opengraph-image.tsx` renders the social preview with `next/og`'s `ImageResponse`: no image asset to keep in sync, and any route can override it.
- `sitemap.ts` combines static pages with every blog post; `robots.ts` points at it.
- A ready, empty Search Console verification slot in metadata. Google ignores it while unset, so it shipped safely before verification.

## 6. Small, targeted tests

Workflow routes were once three separate string literals (cards, sitemap, canonical). They now come from one frozen constant, and a Vitest suite checks that each route resolves to a real `page.tsx` and that the showcase links go through the constant instead of a literal.

Files: [workflow-routes.ts](../code/lib/workflow-routes.ts), [workflow-routes.test.ts](../code/lib/workflow-routes.test.ts).

## 7. Honesty as a design constraint

Anything on the site that looks like live data (the hero console, the eval panel, the ship pipeline) says it's illustrative. The `/proof` page is the one place that claims "this runs", and its output is regenerated from a real run whenever the demo source changes, never hand-edited.
