import { notFound } from "next/navigation";
import Link from "next/link";
import { services } from "@/lib/business";
import { RequestForm } from "@/components/request-form";
import { ContactForm } from "@/components/contact-form";
import { TruckSlider } from "@/components/truck-slider";
const pages: Record<string, { title: string; intro: string }> = {
  services: {
    title: "Transport for life. And business.",
    intro:
      "Five practical ways to move your goods around Beitbridge and surrounding areas.",
  },
  fleet: {
    title: "A truck with a local purpose.",
    intro:
      "Our 3-tonne truck supports local transport requirements, subject to load and route review.",
  },
  bookings: {
    title: "Let’s plan your next move.",
    intro:
      "Send a booking request. Our team will review the details and contact you before transport is confirmed.",
  },
  "request-quote": {
    title: "Your load. Your route. Your quotation.",
    intro:
      "Tell us what you need to transport. We review each request before discussing pricing and availability.",
  },
  about: {
    title: "Moving Beitbridge Forward.",
    intro:
      "TransChibaro Logistics connects local transport needs with practical, personal service.",
  },
  contact: {
    title: "A conversation gets things moving.",
    intro:
      "Talk to us about your load, ask a question or discuss a route around Beitbridge.",
  },
  "privacy-policy": {
    title: "Privacy policy",
    intro: "How TransChibaro Logistics handles information you share with us.",
  },
  "terms-and-conditions": {
    title: "Terms & conditions",
    intro:
      "Please read these terms before submitting a quotation or booking request.",
  },
};
export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = pages[slug];
  return p
    ? {
        title: p.title,
        description: p.intro,
        alternates: { canonical: "/" + slug },
      }
    : {};
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">
            TransChibaro LOGISTICS / {slug.replaceAll("-", " ").toUpperCase()}
          </span>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
      </section>
      <section className="container section page-body">
        {slug === "services" ? (
          <div
            className="service-grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
            }}
          >
            {services.map((s) => (
              <article className="service-card" key={s.slug}>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <Link href={"/services/" + s.slug}>Explore service &rarr;</Link>
              </article>
            ))}
          </div>
        ) : slug === "bookings" || slug === "request-quote" ? (
          <div className="form-card">
            <RequestForm booking={slug === "bookings"} />
          </div>
        ) : slug === "fleet" ? (
          <>
            <TruckSlider />
            <h2>3-tonne truck</h2>
            <p>
              The stated carrying specification is 3,000 kg. Every load requires
              review of weight, dimensions, access, cargo suitability and route
              conditions.
            </p>
            <Link className="button" href="/request-quote">
              Discuss your load &rarr;
            </Link>
          </>
        ) : slug === "about" ? (
          <>
            <h2>Local transport, with a clear process.</h2>
            <p>
              Based in Beitbridge, Zimbabwe, TransChibaro Logistics provides general
              cargo transport, household and office removals, furniture
              transportation, business deliveries and custom-load enquiries.
            </p>
            <p>
              Our team reviews your load and route, discusses a quotation, and
              confirms arrangements with you before transport.
            </p>
            <h2>Transport / Move / Deliver / Grow Together</h2>
            <p>
              Our verified operating area is Beitbridge and surrounding areas.
              Other destinations require an individual enquiry and explicit
              confirmation.
            </p>
            <Link className="button" href="/contact">
              Discuss your next move &rarr;
            </Link>
          </>
        ) : slug === "contact" ? (
          <div className="form-card">
            <h2>Contact our team</h2>
            <p>
              <a href="https://wa.me/263775008064">
                WhatsApp: +263 77 500 8064
              </a>
              <br />
              <a href="tel:+263783051430">Calls: +263 783 051 430</a>
              <br />
              <a href="mailto:kamhungachibs@gmail.com">
                kamhungachibs@gmail.com
              </a>
            </p>
            <p>Beitbridge, Zimbabwe</p>
            <ContactForm />
          </div>
        ) : slug === "privacy-policy" ? (
          <>
            <h2>Information we collect</h2>
            <p>
              Forms collect your name, contact details, transport requirements
              and preferred dates. We use this information to respond to your
              enquiry and manage requested services. Required fields are
              identified.
            </p>
            <h2>Use and access</h2>
            <p>
              Authorized staff can access enquiries. Hosting and communications
              providers may process information needed for those services. We do
              not use enquiry details in public advertisements. The automated
              information assistant does not need personal information.
            </p>
            <h2>Cookies and security</h2>
            <p>
              Essential session cookies protect requests and administrator
              sign-in. We use access controls and security logs. Do not send
              sensitive identity documents through the chat widget.
            </p>
            <h2>Retention and your requests</h2>
            <p>
              Contact kamhungachibs@gmail.com to request access, correction or
              deletion. Records may need to be retained for operational or legal
              requirements. The business must finalize its retention schedule
              before production launch.
            </p>
            <h2>External communications</h2>
            <p>
              WhatsApp is an external service with its own privacy terms. Send
              photographs only when requested and avoid unrelated personal
              information.
            </p>
          </>
        ) : (
          <>
            <h2>Requests and confirmation</h2>
            <p>
              A quotation or booking request is an enquiry. It does not reserve
              a vehicle or guarantee availability or dates. Our team must
              explicitly agree to transport arrangements.
            </p>
            <h2>Pricing and load suitability</h2>
            <p>
              Pricing, currency, payment arrangements, dry or wet rate
              inclusions and conditions are specified in your quotation. No
              automatic prices are offered. Provide accurate weight, dimensions,
              addresses and access details.
            </p>
            <h2>Capacity and service area</h2>
            <p>
              The truck has a stated 3-tonne specification. Every load requires
              review. Services outside Beitbridge and surrounding areas require
              explicit confirmation.
            </p>
            <h2>Changes and cancellations</h2>
            <p>
              Contact the business promptly to discuss changes or cancellation.
              Applicable charges and conditions must be agreed in your
              quotation. Questions: kamhungachibs@gmail.com or +263 77 500 8064.
            </p>
          </>
        )}
      </section>
    </>
  );
}
