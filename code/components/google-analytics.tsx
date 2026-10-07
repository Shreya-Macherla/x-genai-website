"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { CONSENT_CHANGE_EVENT, CONSENT_KEY } from "@/components/cookie-banner";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Loads Google Analytics only after the visitor clicks "Allow" in the cookie
 * banner, and only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set (Vercel project
 * env var, the "G-..." ID from GA Admin → Data streams). With no ID it
 * renders nothing, so it's safe to ship before the GA property exists.
 *
 * If the visitor later withdraws consent, GA is told to stop storing data
 * and its cookies are cleared on the spot.
 */
export function GoogleAnalytics() {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    const sync = () => {
      let isGranted = false;
      try {
        isGranted = localStorage.getItem(CONSENT_KEY) === "granted";
      } catch {
        // Storage blocked: treat as no consent.
      }
      setGranted(isGranted);
      if (!isGranted && window.gtag) {
        window.gtag("consent", "update", { analytics_storage: "denied" });
        clearGaCookies();
      }
    };
    sync();
    window.addEventListener(CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, sync);
  }, []);

  useEffect(() => {
    if (granted && window.gtag) {
      window.gtag("consent", "update", { analytics_storage: "granted" });
    }
  }, [granted]);

  if (!GA_ID || !granted) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
gtag('config', '${GA_ID}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}

/** Sends a GA event. A no-op when GA isn't loaded (no ID) or consent isn't
 * currently granted, which also covers consent withdrawn mid-visit after the
 * GA script was already on the page. */
export function trackEvent(name: string, params?: Record<string, string>) {
  try {
    if (localStorage.getItem(CONSENT_KEY) !== "granted") return;
  } catch {
    return;
  }
  window.gtag?.("event", name, params);
}

function clearGaCookies() {
  const host = window.location.hostname;
  const domains = [host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (name === "_ga" || name.startsWith("_ga_")) {
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
      }
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  }
}
