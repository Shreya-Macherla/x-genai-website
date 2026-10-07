/**
 * Single source of truth for the workflow-detail routes, referenced from
 * demo-showcase.tsx (card links), sitemap.ts, and each page's own
 * metadata.alternates.canonical. Was three independent string literals
 * (review finding: maintainability, confidence 5) — a rename now only
 * needs to happen here.
 */
export const WORKFLOW_ROUTES = Object.freeze({
  onboardingAgent: "/workflows/onboarding-agent",
  clientReporting: "/workflows/client-reporting",
});
