import Link from "next/link";
import { notFound } from "next/navigation";
import { services } from "@/lib/business";
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = services.find((s) => s.slug === slug);
  return {
    title: s?.name,
    description: s?.description,
    alternates: { canonical: "/services/" + slug },
  };
}
export default async function Service({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = services.find((s) => s.slug === slug);
  if (!s) notFound();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">OUR SERVICES / BEITBRIDGE</span>
          <h1>{s.name}</h1>
          <p>{s.short}</p>
        </div>
      </section>
      <section className="container section page-body">
        <h2>{s.description}</h2>
        <p>
          Tell us about your pickup location, destination, preferred date and
          goods. We’ll review the load and discuss suitable arrangements.
        </p>
        <h2>Help us prepare your quotation</h2>
        <ul>
          <li>Describe the goods, estimated weight and dimensions.</li>
          <li>
            Tell us about stairs, access restrictions or special handling needs.
          </li>
          <li>
            Choose a dry or wet rate preference, or ask us to explain the
            options.
          </li>
        </ul>
        <p>
          The 3-tonne truck specification does not automatically approve a load.
          Prices, availability and dates require confirmation.
        </p>
        <Link className="button" href="/request-quote">
          Request a quotation &rarr;
        </Link>
      </section>
    </>
  );
}
