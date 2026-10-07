"use client";

import { useState } from "react";
import { trackEvent } from "@/components/google-analytics";
import { formatUtmForEmail } from "@/lib/utm";

/**
 * PROTOTYPE: no backend yet. Submissions fall back to a prefilled mailto:
 * to hello@x-genai.com. Before go-live, wire this to a form service or a
 * server action + email provider (ticket #12 territory).
 *
 * Ticket #33 fix (2026-09-17): mailto: has no success signal, on a device
 * with no default mail client configured (increasingly common on desktop,
 * where people use webmail in-browser), clicking submit silently does
 * nothing and the lead is lost with no error shown. Rather than pretend
 * that's fixed, this now always shows the exact message alongside a copy
 * button and the raw address, so a visitor whose mail client didn't open
 * still has an obvious way to actually send it. Real delivery into
 * hello@x-genai.com and any failure-alerting are still open, see #33's
 * resolution notes: that needs inbox access this session doesn't have.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [mailtoHref, setMailtoHref] = useState("");
  const [plainMessage, setPlainMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const company = String(data.get("company") ?? "") || "no company given";
    const message = String(data.get("message") ?? "");

    const subject = `Website inquiry from ${name}`;
    const body = `${message}\n\nSent by ${name}, ${company} (${email})${formatUtmForEmail()}`;
    const href = `mailto:hello@x-genai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setMailtoHref(href);
    setPlainMessage(`To: hello@x-genai.com\nSubject: ${subject}\n\n${body}`);
    trackEvent("contact_form_submit");
    window.location.href = href;
    setSent(true);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context). The textarea
      // below is still there to select and copy manually.
    }
  };

  if (sent) {
    return (
      <div className="mt-6 space-y-4 rounded-lg border border-line p-4 text-sm">
        <p className="text-muted">
          Your email client should have opened with the message ready to
          send. If nothing happened (no default mail app is set up on this
          device), copy the message below and paste it into whatever email
          you use, or email{" "}
          <a href="mailto:hello@x-genai.com" className="text-accent-dim hover:underline">
            hello@x-genai.com
          </a>{" "}
          directly.
        </p>
        <textarea
          readOnly
          value={plainMessage}
          rows={5}
          className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-xs text-muted"
          onFocus={(e) => e.currentTarget.select()}
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCopy}
            className="btn-press transition-colors rounded-lg border border-line px-4 py-2 text-xs font-medium hover:border-accent"
          >
            {copied ? "Copied" : "Copy message"}
          </button>
          <a
            href={mailtoHref}
            className="btn-press transition-colors rounded-lg border border-line px-4 py-2 text-xs font-medium hover:border-accent"
          >
            Try opening email client again
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-muted">Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs text-muted">Company (optional)</span>
        <input
          name="company"
          autoComplete="organization"
          className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="text-xs text-muted">What are you trying to automate?</span>
        <textarea
          name="message"
          required
          rows={4}
          className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
        />
      </label>
      <button
        type="submit"
        className="btn-press transition-colors rounded-lg border border-line px-6 py-3 text-sm font-medium hover:border-accent"
      >
        Send message
      </button>
    </form>
  );
}
