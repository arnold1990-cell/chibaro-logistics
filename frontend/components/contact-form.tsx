"use client";
import { useState } from "react";
import { api } from "@/lib/api";
export function ContactForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setBusy(true);
        try {
          const r = await api<{ message: string }>("/contact", {
            method: "POST",
            body: JSON.stringify({
              ...Object.fromEntries(data),
              consent: data.get("consent") === "on",
              website: "",
            }),
          });
          setMessage(r.message);
        } catch (e) {
          setMessage((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="form-grid">
        <label className="field">
          Full name *<input name="fullName" autoComplete="name" required maxLength={150} />
        </label>
        <label className="field">
          Phone number *
          <input
            name="phone"
            type="tel" autoComplete="tel" inputMode="tel"
            required
            minLength={7}
            maxLength={30}
          />
        </label>
        <label className="field span-2">
          Email (optional)
          <input name="email" type="email" autoComplete="email" inputMode="email" />
        </label>
        <label className="field span-2">
          How can we help? *
          <textarea name="message" rows={4} required maxLength={5000} />
        </label>
      </div>
      <label className="check">
        <input type="checkbox" name="consent" required />I agree to being
        contacted about this enquiry under the privacy policy.
      </label>
      <button className="button" disabled={busy}>
        {busy ? "Sending..." : "Send enquiry"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
