import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Package,
  House,
  Armchair,
  Store,
  Truck,
  MapPin,
  MessageCircle,
  CalendarCheck,
  Headphones,
  ShieldCheck,
} from "lucide-react";
import { services } from "@/lib/business";
import { RequestForm } from "@/components/request-form";
import { TransportPhoto } from "@/components/transport-photo";
const icons = [Package, House, Armchair, Store, Truck];
export default function Home() {
  return (
    <>
      <section className="photo-hero" aria-labelledby="hero-title">
        <TransportPhoto hero src="/images/long-white-green-truck.png" alt="Long white flatbed truck with green detail on the cab, viewed from the side" />
        <div className="hero-wash" />
        <div className="container photo-hero-content">
          <div className="photo-hero-copy">
            <span className="eyebrow">TRANSCHIBARO LOGISTICS / BEITBRIDGE</span>
            <h1 id="hero-title">Your next move.<br /><em>Made personal.</em></h1>
            <p>Local cargo, home moves and business deliveries. Tell us what you need to move. We will help you plan the next step.</p>
            <div className="actions">
              <Link className="button" href="/request-quote">Request a Quote <ArrowUpRight size={18} /></Link>
              <Link className="button secondary" href="/services">Our Services <ArrowRight size={18} /></Link>
            </div>
          </div>
        </div>
      </section>
      <div className="home-location"><div className="container"><span><MapPin size={16} /> Beitbridge &amp; surrounding areas</span><span>Transport / Move / Deliver / Grow Together</span></div></div>
      <section className="container section transport-stories" aria-labelledby="transport-stories-title">
        <div className="section-heading">
          <div><span className="eyebrow">LOCAL ROOTS. PERSONAL SERVICE.</span><h2 id="transport-stories-title">A practical partner<br />for the road ahead.</h2></div>
          <p>From your first enquiry to agreed transport arrangements, we keep your load and your needs at the centre of the conversation.</p>
        </div>
        <div className="photo-card-grid">
          <article className="transport-card">
            <TransportPhoto src="/images/loading-truck.png" alt="A man loading cardboard boxes onto the open tailgate of a white truck" />
            <div className="transport-card-copy"><span className="eyebrow">YOUR LOAD, YOUR PLANS</span><h3>Every move starts with a conversation.</h3><p>Moving furniture, household goods or business stock? Share your pickup, destination and load details for our team to review.</p><Link className="text-link" href="/about">Meet TransChibaro <ArrowUpRight size={18} /></Link></div>
          </article>
          <article className="transport-card">
            <TransportPhoto src="/images/white-truck-side.png" alt="White truck with silver drop-side cargo panels, viewed from the side" />
            <div className="transport-card-copy"><span className="eyebrow">TRANSPORT THAT FITS</span><h3>Let us find the right arrangements.</h3><p>We review weight, dimensions, access and route before confirming transport. Explore the truck specification and discuss your requirements.</p><Link className="text-link" href="/fleet">Explore transport <ArrowUpRight size={18} /></Link></div>
          </article>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">WHAT WE DO</span>
            <h2>
              Every load has a story.
              <br />
              Let’s move yours forward.
            </h2>
          </div>
          <p>
            From a new home to your next business delivery, find the right
            transport service for your needs.
          </p>
        </div>
        <div className="service-grid">
          {services.map((s, i) => {
            const Icon = icons[i];
            return (
              <article className="service-card" key={s.slug}>
                <div className="service-number">
                  0{i + 1}
                  <Icon size={28} />
                </div>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <Link href={"/services/" + s.slug}>
                  Learn more <ArrowUpRight size={18} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
      <section className="process section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SIMPLE FROM THE START</span>
              <h2>
                Your next move,
                <br />
                in four clear steps.
              </h2>
            </div>
            <Link className="text-link" href="/request-quote">
              Let’s get started <ArrowUpRight size={20} />
            </Link>
          </div>
          <div className="steps">
            {[
              [
                "Request",
                "Tell us what you’re moving, where from and where to.",
              ],
              [
                "Review",
                "We review your load, route and transport requirements.",
              ],
              [
                "Schedule",
                "Together, we confirm pickup and delivery arrangements.",
              ],
              [
                "Transport",
                "Your goods are collected and transported as agreed.",
              ],
            ].map(([title, desc], i) => (
              <div className="step" key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section container quote-layout" id="quote">
        <div className="quote-copy">
          <span className="eyebrow">TELL US ABOUT YOUR LOAD</span>
          <h2>
            A good move
            <br />
            starts with
            <br />
            <em>a conversation.</em>
          </h2>
          <p>
            Give us a few details and we’ll review your transport requirements.
            No automatic prices. Just a quotation for your specific needs.
          </p>
          <div className="contact-callout">
            <MessageCircle />
            <div>
              <strong>Prefer to talk it through?</strong>
              <a href="https://wa.me/263775008064">+263 77 500 8064 &rarr;</a>
            </div>
          </div>
          <div className="rate-note">
            <ShieldCheck />
            <p>
              Dry and wet rate enquiries welcome.
              <br />
              Availability and pricing are subject to review.
            </p>
          </div>
        </div>
        <div className="form-card">
          <h3>Request a quotation</h3>
          <p className="muted">Your details, your load, your preferred date.</p>
          <RequestForm />
        </div>
      </section>
      <section className="area-section">
        <div className="container area-grid">
          <div>
            <span className="eyebrow">CLOSE TO HOME. READY TO HELP.</span>
            <h2>
              Moving
              <br />
              <em>Beitbridge Forward.</em>
            </h2>
            <p>
              Based in Beitbridge, Zimbabwe, serving Beitbridge and surrounding
              areas. Have a destination in mind? Share it with us for review.
            </p>
            <Link href="/contact" className="button">
              Discuss your route <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="area-card">
            <MapPin size={44} />
            <h3>Beitbridge</h3>
            <p>Zimbabwe</p>
            <span className="area-pill">
              Local transport & surrounding areas
            </span>
            <p className="form-note">
              Every route is reviewed before confirmation.
            </p>
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="smart-grid">
          {[
            [MessageCircle, "WhatsApp enquiries", "A direct line to our team."],
            [
              CalendarCheck,
              "Online booking requests",
              "Share your plans at any time.",
            ],
            [
              Headphones,
              "Customer support",
              "People who understand your move.",
            ],
            [
              ShieldCheck,
              "Automated assistance",
              "Quick answers from verified information.",
            ],
          ].map(([Icon, title, desc]) => {
            const I = Icon as typeof MessageCircle;
            return (
              <div key={String(title)}>
                <I size={24} />
                <h3>{String(title)}</h3>
                <p>{String(desc)}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
