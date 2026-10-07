"use client";

import { useEffect, useState } from "react";

export const CONSENT_KEY = "xgenai-analytics-consent";
/** Fired on window whenever the visitor makes or changes their choice. */
export const CONSENT_CHANGE_EVENT = "xgenai-consent-change";
const REOPEN_EVENT = "xgenai-cookie-settings-open";

/**
 * Opt-in consent banner for Google Analytics only.
 * Vercel Analytics (cookie-less) runs regardless and needs no consent.
 * GA is loaded by GoogleAnalytics (google-analytics.tsx), which listens for
 * CONSENT_CHANGE_EVENT and only loads once the choice is "granted".
 */

/** Call from anywhere (e.g. a "Cookie settings" button) to let a visitor
 * change their choice, per EU guidance that withdrawing consent should be
 * as easy as giving it, no more "clear your browser data" instructions. */
export function openCookieSettings() {
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) queueMicrotask(() => setVisible(true));
    const reopen = () => setVisible(true);
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  const decide = (granted: boolean) => {
    localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface p-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Cookie-less analytics run by default. Allow optional Google
          Analytics cookies for more detailed stats?{" "}
          <a href="/cookies" className="text-accent-dim hover:underline">
            Cookie policy
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide(false)}
            className="rounded-lg border border-line px-4 py-1.5 text-sm text-muted hover:text-foreground"
          >
            No thanks
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-on-accent hover:opacity-90"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
