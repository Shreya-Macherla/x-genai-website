# Page by page

Every page shares one root layout (`app/layout.tsx`): sticky header with a services mega-menu, footer, cookie banner, a faint ambient background, a custom cursor on desktop, UTM capture, analytics, and a fade-in transition between pages. Pages themselves are mostly server components; anything that animates or reads the browser is a small client component dropped in.

## Home `/`

The homepage was picked from a prototype round. We built five variants (three dark, one warm "studio", one editorial), reviewed them live, kept the studio one and grafted the editorial version's hero question in as its own section. The losing variants live in git history, not in the codebase.

Top to bottom:

1. **Hero.** A word-by-word masked headline ("Your team has better things to do than *copy-paste*"), a subhead, and a two-button CTA (book a call / send a message). This is the one place we allowed a bold animation, so it doesn't turn into a tic on every heading.
2. **Agent orchestrator + trace.** A dark "ops console" card: flowchart with animated connectors, stat tiles doing a bounded random walk, and a scrolling log. It's labeled as a simulation in its own footer, because implying a live client feed would be dishonest.
3. **Model marquee and fact ticker.** The models and tools we build with, and short facts.
4. **Research marquee.** Cards citing current industry research, each checked against a primary source.
5. **Workflow walkthrough.** Input, workflow, review, result, using the real demo from `/proof` rather than an invented example.
6. **Service showcase and demo showcase.** The five services with illustrative mockups, then the two runnable demos linking to their workflow pages.
7. **Engineering practices teaser.** Four short labels (latency, observability, human-in-the-loop, compliance) linking to the full version on `/services`.
8. **Working together deck.** A scroll-driven card deck that pins and pages through the five engagement stages. Falls back to a plain list under reduced motion.
9. **Closing line and CTA.**

## Services `/services`

Explains the five-stage ladder (audit, build, launch, retainer, scale) and what "built properly" means.

- **Stage stack.** A scroll-driven deck where each stage holds still long enough to read, then slides. The hold time scales with how much content a stage has, clamped so pacing still feels even.
- **Engineering practices (full).** Four cards plus a note on staying after launch.
- **Evals explained.** What an eval is and how drift gets caught, with an illustrative panel.
- **Ship pipeline.** An animated build pipeline, labeled illustrative.
- **Tech stack.** The tools we actually use.
- A pointer to `/proof` so "illustrative" never reads as "made up".

## Proof `/proof`

The answer to "is any of this real?". One enquiry-to-CRM pipeline, run against synthetic data with deliberately nasty test cases: a replayed duplicate, a missing field, an ambiguous message, a simulated provider timeout, and a prompt-injection attempt. The page lists the guardrails (idempotent writes, schema validation first, capped retries, visible failures, audit trail, nothing sent without approval) and shows the console output copied from an actual run, failures included.

## Workflow pages `/workflows/onboarding-agent`, `/workflows/client-reporting`

One page per demo: what it does, how it works step by step, the guardrails, and real sample output. Route paths come from a single constant (`lib/workflow-routes.ts`) used by the showcase cards, the sitemap and each page's canonical URL, with a test making sure they all resolve.

## About `/about`

How we work and what we care about: consulting before building, education built in, engineering discipline, pragmatic tooling, compliance by default, and one point of accountability for each project.

## Amsterdam `/amsterdam`

A local page with real substance rather than "based in Amsterdam" restated: overlap with client time zones, in-person availability, Dutch and EU invoicing, and why GDPR is part of the architecture, not a translated policy.

## Contact `/contact`

Two equal-weight options side by side: a Cal.com link for a 15 minute call, and a message form. The form has no backend; it builds a `mailto:` with the message, adds the visitor's UTM source if there is one, and then always shows the message with a copy button in case no mail client opened.

## Blog `/blog`, `/blog/[slug]`

Posts live in a typed file (`lib/posts.tsx`) with a slug, category, date, read time and a JSX body. `generateStaticParams` prebuilds every post, each gets its own metadata, and the sitemap picks them up automatically. A newsletter signup sits under each post using the same mailto plus copy fallback as the contact form.

## Legal `/privacy`, `/terms`, `/cookies`

Plain-language policies. The cookie page matches what the banner actually does, and a "cookie settings" button in the footer reopens the banner so withdrawing consent is as easy as giving it.
