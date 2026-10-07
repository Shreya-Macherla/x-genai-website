import type { MetadataRoute } from "next";
import { posts } from "@/lib/posts";
import { WORKFLOW_ROUTES } from "@/lib/workflow-routes";

const BASE_URL = "https://x-genai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "", priority: 1 },
    { path: "/services", priority: 0.9 },
    { path: "/proof", priority: 0.7 },
    { path: WORKFLOW_ROUTES.onboardingAgent, priority: 0.6 },
    { path: WORKFLOW_ROUTES.clientReporting, priority: 0.6 },
    { path: "/about", priority: 0.8 },
    { path: "/contact", priority: 0.8 },
    { path: "/amsterdam", priority: 0.6 },
    { path: "/blog", priority: 0.7 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
    { path: "/cookies", priority: 0.3 },
  ].map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    priority,
  }));

  const blogPosts = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    priority: 0.6,
  }));

  return [...staticPages, ...blogPosts];
}
