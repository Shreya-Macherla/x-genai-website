import type { Metadata } from "next";
import { DM_Sans, Sora, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ClickTracker } from "@/components/click-tracker";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieBanner } from "@/components/cookie-banner";
import { AmbientField } from "@/components/ambient-field";
import { CustomCursor } from "@/components/custom-cursor";
import { UtmCapture } from "@/components/utm-capture";
import { PageTransition } from "@/components/page-transition";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const display = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "X-GenAI · Custom AI agents and workflow automation";
const description =
  "Custom AI agents and workflow automation. Built in Amsterdam, working worldwide.";

export const metadata: Metadata = {
  metadataBase: new URL("https://x-genai.com"),
  title: {
    default: title,
    template: "%s · X-GenAI",
  },
  description,
  alternates: { canonical: "/" },
  // Ticket #35: social preview. The actual image comes from
  // app/opengraph-image.tsx (a code-generated PNG), Next.js wires it into
  // these tags automatically. Per-page metadata can override title/
  // description here without needing its own image.
  openGraph: {
    title,
    description,
    url: "https://x-genai.com",
    siteName: "X-GenAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  // Ticket #37: Search Console verification. Empty until the owner adds
  // their code (Search Console → Settings → Ownership verification → HTML
  // tag → paste the content value here, no quotes). Google ignores this
  // tag entirely while it's unset, so it's safe to ship as-is.
  verification: {
    // google: "",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${display.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* No-JS fallback: every element gated by the Reveal/mount
            animations (reveal.tsx, agent-trace.tsx) carries [data-reveal]
            and starts hidden, waiting for client JS to reveal it. A
            <noscript> block's contents are only ever honored by the
            browser when scripting is disabled, so this rule can never
            fight the real animated state when JS is working. It only
            forces reveal-gated content back to its final, visible state
            for the case client JS never runs at all (hero headline,
            subhead, and CTAs included). */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important;}`}</style>
        </noscript>
        <UtmCapture />
        <AmbientField variant="site" />
        <CustomCursor />
        <SiteHeader />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
        <CookieBanner />
        <Analytics />
        <ClickTracker />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
