"use client";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  ArrowUpRight,
  MapPin,
  Phone,
  MessageCircle,
  Send,
} from "lucide-react";
import { api } from "@/lib/api";
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const menuTrigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); menuTrigger.current?.focus(); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  function toggleMenu(event: React.MouseEvent<HTMLButtonElement>) {
    menuTrigger.current = event.currentTarget;
    setOpen(!open);
  }
  if (path.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <div className="topbar">
        <div className="container">
          <span>
            <MapPin size={13} /> Beitbridge, Zimbabwe
          </span>
          <span>Transport / Move / Deliver / Grow Together</span>
          <a href="tel:+263783051430">
            <Phone size={13} /> +263 783 051 430
          </a>
        </div>
      </div>
      <header className="header">
        <div className="container nav">
          <Link className="brand" href="/" aria-label="TransChibaro Logistics home">
            <BrandLogo />
            <span className="company-name" aria-hidden="true">
              <span className="company-wordmark"><span>Trans</span>Chibaro</span>{" "}
              <span className="company-descriptor">Logistics</span>
            </span>
          </Link>
          <button
            className="menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={toggleMenu}
          >
            {open ? <X /> : <Menu />}
          </button>
          {open && <button className="menu-backdrop" aria-label="Close navigation" onClick={() => { setOpen(false); menuTrigger.current?.focus(); }} />}
          <nav
            id="main-navigation"
            className={open ? "navlinks open" : "navlinks"}
            aria-label="Main navigation"
          >
            {[
              ["/", "Home"],
              ["/services", "Services"],
              ["/fleet", "Fleet"],
              ["/bookings", "Bookings"],
              ["/about", "About"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <Link
                aria-current={path === href ? "page" : undefined}
                onClick={() => setOpen(false)}
                key={href}
                href={href}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link className="button nav-cta" href="/request-quote">
            Request Quote <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer>
        <div className="container footer-grid">
          <div>
            <Link href="/" className="brand">
              <BrandLogo />
            </Link>
            <p>
              Local roots. Forward thinking.
              <br />
              Moving Beitbridge Forward.
            </p>
            <span className="eyebrow">
              Transport / Move / Deliver / Grow Together
            </span>
          </div>
          <div>
            <h3>Explore</h3>
            <Link href="/services">Our services</Link>
            <Link href="/fleet">Our truck</Link>
            <Link href="/bookings">Booking requests</Link>
            <Link href="/about">About TransChibaro</Link>
          </div>
          <div>
            <h3>Let’s talk transport</h3>
            <a href="https://wa.me/263775008064">WhatsApp: +263 77 500 8064</a>
            <a href="tel:+263783051430">Calls: +263 783 051 430</a>
            <a href="mailto:kamhungachibs@gmail.com">kamhungachibs@gmail.com</a>
            <p>Beitbridge, Zimbabwe</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>&copy; {new Date().getFullYear()} TransChibaro Logistics</span>
          <div>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-and-conditions">Terms & Conditions</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
      </footer>
      <nav className="mobile-dock" aria-label="Quick actions">
        <Link className="dock-quote" href="/request-quote" onClick={() => setOpen(false)} aria-current={path === "/request-quote" ? "page" : undefined}>Request a Quote <ArrowUpRight size={18} /></Link>
        <Link href="/contact" onClick={() => setOpen(false)} aria-current={path === "/contact" ? "page" : undefined}><Phone size={19} />Contact</Link>
        <button aria-label="Open navigation menu" aria-expanded={open} aria-controls="main-navigation" onClick={toggleMenu}>{open ? <X size={21} /> : <Menu size={21} />}Menu</button>
      </nav>
      <Chat />
    </>
  );
}
function Chat() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "Hi! Ask about our services, service areas or how to request transport. Please avoid sharing personal details here.",
  );
  const [busy, setBusy] = useState(false);
  return (
    <div className="chat">
      {open && (
        <section className="chat-panel" aria-label="Customer assistance">
          <div className="chat-title">
            <strong>TransChibaro assistance</strong>
            <button onClick={() => setOpen(false)} aria-label="Close assistant">
              <X size={18} />
            </button>
          </div>
          <p className="form-note">
            Verified company information / automated assistance
          </p>
          <p role="status">{answer}</p>
          <a href="https://wa.me/263775008064">
            Speak to a person on WhatsApp &rarr;
          </a>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const r = await api<{ answer: string }>("/assistant/messages", {
                  method: "POST",
                  body: JSON.stringify({ message: question }),
                });
                setAnswer(r.answer);
                setQuestion("");
              } catch (e) {
                setAnswer((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <input
              aria-label="Your question"
              maxLength={2000}
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="How can we help?"
            />
            <button disabled={busy} aria-label="Send question">
              <Send size={18} />
            </button>
          </form>
        </section>
      )}
      <button
        className="chat-toggle"
        aria-label="Open customer assistance"
        onClick={() => setOpen(!open)}
      >
        <MessageCircle size={22} />
        <span>Let’s talk</span>
      </button>
    </div>
  );
}
