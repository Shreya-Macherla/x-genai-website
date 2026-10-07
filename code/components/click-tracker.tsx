"use client";

import { useEffect } from "react";
import { trackEvent } from "@/components/google-analytics";

/**
 * One page-wide click listener that sends a Google Analytics event for any
 * element tagged with data-track="event_name". An optional
 * data-track-location="header" says which copy of a button was clicked
 * (the booking link appears in several places). Delegating like this keeps
 * the tagged buttons inside server components, no "use client" needed.
 *
 * mailto: links are tracked automatically as "email_click" so every copy of
 * hello@x-genai.com is covered without tagging each one.
 *
 * Only counts visitors who allowed analytics cookies: without consent GA
 * isn't loaded and trackEvent does nothing.
 */
export function ClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const el = target?.closest<HTMLElement>("[data-track], a[href^='mailto:']");
      if (!el) return;
      const name = el.dataset.track ?? "email_click";
      const location = el.dataset.trackLocation;
      trackEvent(name, location ? { button_location: location } : undefined);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
