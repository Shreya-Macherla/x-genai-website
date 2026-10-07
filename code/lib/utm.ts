"use client";

/**
 * Ticket #37: lead-source measurement, the buildable half.
 *
 * There's no backend and no analytics dashboard that ties a form
 * submission back to a channel (Vercel Analytics tracks pageviews, not
 * form-fill attribution). Search Console verification and a formal UTM
 * rollout across every outbound link are the owner's/HITL side of #37,
 * this covers what a static site can do on its own: capture whatever
 * utm_source/utm_medium/utm_campaign a visitor arrived with, remember it
 * for the session, and let the contact form and newsletter signup stamp it
 * into the message they send, so a channel tag survives from "clicked a
 * LinkedIn post" all the way into the email that lands in the inbox.
 */

const STORAGE_KEY = "xgenai_utm";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/** Call once on mount (e.g. in a layout-level effect) to capture and persist
 *  any UTM params present on the current URL. Safe to call on every page,
 *  it only overwrites storage when the URL actually carries new UTM params,
 *  so the original landing source sticks across a multi-page visit. */
export function captureUtmFromLocation() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const found: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) found[key] = value;
  }
  if (Object.keys(found).length > 0) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    } catch {
      // sessionStorage unavailable (private mode, etc.), attribution is
      // best-effort, never block on it.
    }
  }
}

/** Read back whatever UTM params were captured this session, if any. */
export function getStoredUtm(): UtmParams | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : null;
  } catch {
    return null;
  }
}

/** Formats stored UTM data as a plain-text line to append to a lead email,
 *  or "" when nothing was captured (so callers can splice it in unconditionally). */
export function formatUtmForEmail(): string {
  const utm = getStoredUtm();
  if (!utm || Object.keys(utm).length === 0) return "";
  const parts = UTM_KEYS.filter((k) => utm[k]).map((k) => `${k}=${utm[k]}`);
  return `\n\nSource: ${parts.join(", ")}`;
}
