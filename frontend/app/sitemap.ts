import { services } from "@/lib/business";
export default function sitemap() {
  const base = process.env.APP_URL || "http://localhost:3000";
  return [
    "",
    "/services",
    "/fleet",
    "/bookings",
    "/request-quote",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
    ...services.map((s) => "/services/" + s.slug),
  ].map((path) => ({ url: base + path }));
}
