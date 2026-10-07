"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/* The hero's centerpiece: a dark "ops console" card (flowchart, live-
   looking stat tiles, and a streaming log), replacing the old AgentTrace
   timeline with something closer to what a real agent-monitoring
   dashboard looks like. The numbers move (a slow, bounded random walk,
   not a real feed), the connector lines march a dashed current, and the
   log scrolls, but the footer says so outright: this is a labeled
   simulation of how X-GenAI structures a pipeline, not a specific
   client's data, same disclosure the reference site uses, because
   implying a live client feed without one would be dishonest. */

const logLines = [
  { ok: false, text: "ticket #1042 received", detail: "classifying intent" },
  { ok: true, text: "matched to docs", detail: "replied in 4s" },
  { ok: false, text: "ticket #1043 flagged", detail: "refund, needs sign-off" },
  { ok: true, text: "escalated to human", detail: "policy: refunds aren't automated" },
  { ok: true, text: "summary posted to #support", detail: "3 resolved, 1 escalated" },
  { ok: false, text: "ticket #1044 received", detail: "classifying intent" },
  { ok: true, text: "matched to docs", detail: "replied in 6s" },
];

/* Fixed pixel coordinates for the flowchart canvas: lets the SVG connector
   paths (curved fan-out below) line up exactly with each box's edge. The
   canvas sits in an overflow-x-auto track so narrow viewports scroll
   instead of squeezing the diagram. */
const FLOW_BOXES = {
  trigger: { x: 0, y: 77, w: 110, h: 46 },
  agent: { x: 160, y: 77, w: 110, h: 46 },
  autoReply: { x: 340, y: 4, w: 120, h: 46 },
  escalate: { x: 340, y: 77, w: 120, h: 46 },
  crmSync: { x: 340, y: 150, w: 120, h: 46 },
};
const FLOW_CANVAS = { width: 460, height: 196 };

function FlowBox({
  label,
  sub,
  tone = "default",
  box,
}: {
  label: string;
  sub: string;
  tone?: "default" | "active";
  box: { x: number; y: number; w: number };
}) {
  return (
    <div
      style={{ left: box.x, top: box.y, width: box.w }}
      className={`absolute rounded-lg border px-3 py-2 font-mono transition-all duration-300 hover:-translate-y-0.5 hover:border-sage/60 hover:bg-sage/10 hover:z-10 ${
        tone === "active" ? "border-sage/60 bg-sage/10" : "border-white/15 bg-white/[0.03]"
      }`}
    >
      <p className="text-[11px] font-bold tracking-wide text-on-ink">{label}</p>
      <p className="text-[10px] text-on-ink/45">{sub}</p>
    </div>
  );
}

function useLiveNumber(base: number, spread: number, intervalMs: number) {
  const [value, setValue] = useState(base);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setValue((v) => {
        const next = v + Math.round((Math.random() - 0.45) * spread);
        return Math.max(base - spread * 3, Math.min(base + spread * 3, next));
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [base, spread, intervalMs]);
  return value;
}

export function AgentOrchestrator() {
  const runs = useLiveNumber(1042, 3, 2600);
  const latency = useLiveNumber(412, 18, 3100);
  const errorRate = useLiveNumber(18, 4, 2900); // /100 for a percent with one decimal

  const [cursor, setCursor] = useState(3);
  const [logPaused, setLogPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (logPaused) return;
    const id = setInterval(() => {
      setCursor((c) => (c >= logLines.length ? 3 : c + 1));
    }, 2400);
    return () => clearInterval(id);
  }, [logPaused]);

  const shown = logLines.slice(Math.max(0, cursor - 4), cursor);

  return (
    <div
      ref={rootRef}
      className="rounded-2xl border border-white/10 bg-ink p-5 text-on-ink shadow-[0_28px_70px_-24px_rgb(var(--shadow-rgb)/0.55)] transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_36px_90px_-20px_rgb(var(--shadow-rgb)/0.7)] sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] tracking-wide text-on-ink/55">
          AGENT ORCHESTRATOR · SUPPORT_TRIAGE_V1
        </p>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-sage">
          <span className="size-1.5 rounded-full bg-sage animate-pulse" />
          RUNNING
        </span>
      </div>

      {/* Flowchart: trigger -> agent -> curved fan-out to 3 outcomes.
         Absolutely-positioned boxes over an SVG of bezier connectors,
         see FLOW_BOXES/FLOW_CANVAS above for the shared coordinates. */}
      <div className="mt-6 overflow-x-auto pb-1">
        <div
          className="relative"
          style={{ width: FLOW_CANVAS.width, height: FLOW_CANVAS.height, minWidth: FLOW_CANVAS.width }}
        >
          <svg
            className="absolute inset-0"
            width={FLOW_CANVAS.width}
            height={FLOW_CANVAS.height}
            viewBox={`0 0 ${FLOW_CANVAS.width} ${FLOW_CANVAS.height}`}
            fill="none"
            aria-hidden
          >
            <path className="flow-path" d="M110,100 L160,100" />
            <path
              className="flow-path"
              style={{ animationDelay: "0.1s" }}
              d="M270,100 C300,100 300,27 340,27"
            />
            <path className="flow-path" style={{ animationDelay: "0.2s" }} d="M270,100 L340,100" />
            <path
              className="flow-path"
              style={{ animationDelay: "0.3s" }}
              d="M270,100 C300,100 300,173 340,173"
            />
            <circle cx="270" cy="100" r="2.5" fill="var(--sage)" />
          </svg>
          <FlowBox label="TRIGGER" sub="ticket.created" tone="active" box={FLOW_BOXES.trigger} />
          <FlowBox label="AI AGENT" sub="classify · route" box={FLOW_BOXES.agent} />
          <FlowBox label="AUTO-REPLY" sub="docs match" box={FLOW_BOXES.autoReply} />
          <FlowBox label="ESCALATE" sub="human review" box={FLOW_BOXES.escalate} />
          <FlowBox label="CRM SYNC" sub="write-back" box={FLOW_BOXES.crmSync} />
        </div>
      </div>

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10">
        <div className="bg-ink px-3 py-3 transition-colors duration-300 hover:bg-white/[0.05]">
          <p className="font-mono text-[10px] tracking-wide text-on-ink/45">TICKETS TODAY</p>
          <p className="mt-1 font-mono text-lg font-bold text-sage">{runs.toLocaleString()}</p>
        </div>
        <div className="bg-ink px-3 py-3 transition-colors duration-300 hover:bg-white/[0.05]">
          <p className="font-mono text-[10px] tracking-wide text-on-ink/45">AVG RESPONSE</p>
          <p className="mt-1 font-mono text-lg font-bold text-sage">{latency}ms</p>
        </div>
        <div className="bg-ink px-3 py-3 transition-colors duration-300 hover:bg-white/[0.05]">
          <p className="font-mono text-[10px] tracking-wide text-on-ink/45">ESCALATION RATE</p>
          <p className="mt-1 font-mono text-lg font-bold text-sage">{(errorRate / 100).toFixed(2)}%</p>
        </div>
      </div>

      {/* Streaming log, pauses to read on hover */}
      <div
        onMouseEnter={() => setLogPaused(true)}
        onMouseLeave={() => setLogPaused(false)}
        className="mt-6 space-y-1.5 border-t border-white/10 pt-4 font-mono text-[11px] leading-relaxed"
      >
        {shown.map((line, i) => (
          <p
            key={`${cursor}-${i}`}
            className="rounded px-1.5 py-0.5 -mx-1.5 transition-colors duration-300 [animation:fade-in-up_0.5s_ease-out_forwards] hover:bg-white/[0.04]"
            style={{ "--line-opacity": 0.4 + i * 0.2 } as CSSProperties}
          >
            <span className={line.ok ? "text-sage" : "text-on-ink/40"}>{line.ok ? "✓" : "▸"}</span>{" "}
            <span className="text-on-ink/85">{line.text}</span>{" "}
            <span className="text-on-ink/40">· {line.detail}</span>
          </p>
        ))}
      </div>

      <p className="mt-4 border-t border-white/10 pt-3 text-[10px] leading-relaxed text-on-ink/35">
        Illustrative run: shows how X-GenAI structures an agent pipeline,
        not a specific client&apos;s live data.
      </p>
    </div>
  );
}
