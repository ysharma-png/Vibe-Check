import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/landing", "/creators", "/showcase", "/about", "/terms", "/privacy"],
      disallow: ["/admin", "/dashboard", "/api/"],
    },
    sitemap: "https://cacheflow.ai/sitemap.xml",
  };
}
