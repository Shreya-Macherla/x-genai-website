import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { WORKFLOW_ROUTES } from "./workflow-routes";

// Review finding (testing, confidence 5/10): a demo card's href had no
// check against a real route, so a typo would silently render a dead
// link. This asserts every declared workflow route resolves to a real
// page, and that demo-showcase.tsx links through the shared constants
// rather than a route literal that could drift from them.

describe("WORKFLOW_ROUTES", () => {
  for (const [key, route] of Object.entries(WORKFLOW_ROUTES)) {
    test(`${key} (${route}) resolves to a real page`, () => {
      const pagePath = path.join(__dirname, "..", "app", route, "page.tsx");
      expect(existsSync(pagePath)).toBe(true);
    });
  }

  test("demo-showcase.tsx links through WORKFLOW_ROUTES, not a route literal", () => {
    const source = readFileSync(
      path.join(__dirname, "..", "components", "demo-showcase.tsx"),
      "utf-8",
    );
    expect(source).not.toMatch(/href:\s*["']\/workflows\//);
    expect(source).toContain("WORKFLOW_ROUTES");
  });
});
