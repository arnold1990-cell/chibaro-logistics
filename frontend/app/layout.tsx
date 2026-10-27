import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "TransChibaro Logistics | Transport & Removals in Beitbridge",
    template: "%s | TransChibaro Logistics",
  },
  description:
    "Cargo transport, household removals, furniture transportation and business deliveries in Beitbridge. Request a quotation from TransChibaro Logistics.",
  openGraph: {
    title: "TransChibaro Logistics",
    description: "Moving Beitbridge Forward",
    type: "website",
    locale: "en_ZW",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "TransChibaro Logistics",
    telephone: "+263775008064",
    email: "kamhungachibs@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Beitbridge",
      addressCountry: "ZW",
    },
    areaServed: "Beitbridge and surrounding areas",
    url: process.env.APP_URL || "http://localhost:3000",
  };
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Shell>{children}</Shell>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data).replace(/</g, "\u003c"),
          }}
        />
      </body>
    </html>
  );
}
