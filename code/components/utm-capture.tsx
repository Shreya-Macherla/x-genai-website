"use client";

import { useEffect } from "react";
import { captureUtmFromLocation } from "@/lib/utm";

/** Invisible: just runs the capture-on-mount side effect from lib/utm.ts
 *  once per page load. Lives at the root layout so it sees the landing
 *  page's query string regardless of which page a visitor arrives on. */
export function UtmCapture() {
  useEffect(() => {
    captureUtmFromLocation();
  }, []);
  return null;
}
