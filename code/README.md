# Selected source files

Copied unchanged from the production repo, comments included. The comments are a big part of why these were picked: they record what went wrong and why the code looks the way it does.

| File | Why it's worth reading |
|---|---|
| [app/layout.tsx](app/layout.tsx) | Root layout, metadata and social cards, the `<noscript>` reveal fallback, how site-wide pieces are composed |
| [app/globals.css](app/globals.css) | Design tokens, Tailwind v4 `@theme inline`, motion utility classes, reduced-motion override |
| [app/opengraph-image.tsx](app/opengraph-image.tsx) | Social preview image rendered from JSX |
| [app/sitemap.ts](app/sitemap.ts), [app/robots.ts](app/robots.ts) | Generated sitemap including every blog post |
| [components/reveal.tsx](components/reveal.tsx) | The shared motion primitive and its failure backstops |
| [components/page-transition.tsx](components/page-transition.tsx) | Dependency-free page fade, and why not `<ViewTransition>` |
| [components/working-together-deck.tsx](components/working-together-deck.tsx) | Scroll-pinned card deck with keyboard, arrows and a reduced-motion fallback |
| [components/agent-orchestrator.tsx](components/agent-orchestrator.tsx) | The hero "ops console": SVG flowchart, random-walk stats, labeled as a simulation |
| [components/cookie-banner.tsx](components/cookie-banner.tsx), [components/google-analytics.tsx](components/google-analytics.tsx) | Opt-in consent and GA loading, including withdrawal |
| [components/click-tracker.tsx](components/click-tracker.tsx) | One delegated listener for `data-track` events |
| [components/contact-form.tsx](components/contact-form.tsx) | `mailto:` form with a copy fallback so leads aren't lost |
| [lib/utm.ts](lib/utm.ts), [components/utm-capture.tsx](components/utm-capture.tsx) | Session UTM capture stamped into lead emails |
| [lib/workflow-routes.ts](lib/workflow-routes.ts), [lib/workflow-routes.test.ts](lib/workflow-routes.test.ts) | One source of truth for routes, with a test |

These files import other components that aren't included, so they won't compile on their own.

## Ticket numbers in comments

Comments mention tickets from the private tracker. Here's where each one lives in this repo's Issues:

| Internal ticket | Issue here |
|---|---|
| #9 | #2 Website scope, brand, and content |
| #10 | #3 Website prototype |
| #12 | #4 Domain, deployment, and go-live |
| #38 | #5 Reduced-motion and no-JS fallback |
| #40 | #6 Page transitions and reveal animations |
| #35 | #7 Social preview |
| #33 | #8 Contact and booking lead path |
| #32 | #9 Reproducible demo for /proof |
| #39 | #10 Research marquee vs walkthrough |
| #34 | #11 Nav label style |
| #41 | #12 Cross-page content consistency |
| #36 | #13 Workflow pages and Amsterdam page |
| #37 | #14 Search Console and lead-source measurement |
| #64 | #15 Blog publishing cadence |
