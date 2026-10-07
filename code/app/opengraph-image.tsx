import { ImageResponse } from "next/og";

/* Default Open Graph image for the whole site (ticket #35). Any route
   segment can override this by adding its own opengraph-image.tsx; until
   one exists, this is what every shared link renders: home, blog posts,
   services, all of it. Colors match the brand tokens in globals.css rather
   than importing them (this runs in the OG image runtime, not the app). */

export const alt =
  "X-GenAI: custom AI agents and workflow automation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const background = "#0b0d12";
const foreground = "#e8eaf0";
const muted = "#9aa1b2";
const accent = "#8b5cf6";
const accentDim = "#b39dff";
const line = "#262c3a";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background,
          padding: "72px 84px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: 28,
              fontWeight: 600,
              color: muted,
              letterSpacing: "-0.01em",
            }}
          >
            <span
              style={{
                display: "flex",
                width: 12,
                height: 12,
                borderRadius: 999,
                background: accent,
              }}
            />
            x-genai.com
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 108, fontWeight: 700, letterSpacing: "-0.03em" }}>
            <span style={{ color: accent }}>X</span>
            <span style={{ color: foreground }}>-GenAI</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 38,
              lineHeight: 1.35,
              color: foreground,
              maxWidth: 920,
            }}
          >
            Custom AI agents and workflow automation.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderTop: `1px solid ${line}`,
            paddingTop: "28px",
            fontSize: 24,
            color: accentDim,
          }}
        >
          <span style={{ display: "flex" }}>Built in Amsterdam</span>
          <span style={{ display: "flex", color: line }}>·</span>
          <span style={{ display: "flex" }}>working worldwide</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
