export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: (process.env.APP_URL || "http://localhost:3000") + "/sitemap.xml",
  };
}
