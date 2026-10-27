"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
export default function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <main className="admin" style={{ padding: "1px" }}>
      <div className="admin-login">
        <Link className="brand" href="/">
          <Truck />
          <span>
            TRANSCHIBARO<small>LOGISTICS</small>
          </span>
        </Link>
        <h1>Welcome back.</h1>
        <p>Sign in to your business workspace.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const form = new FormData(e.currentTarget);
            try {
              const csrf = await fetch("/api/v1/auth/csrf").then((r) =>
                r.json(),
              );
              const res = await fetch("/api/v1/auth/login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  [csrf.headerName]: csrf.token,
                },
                body: new URLSearchParams({
                  email: String(form.get("email")).toLowerCase(),
                  password: String(form.get("password")),
                }),
              });
              if (!res.ok)
                throw new Error(
                  res.status === 429
                    ? "Too many attempts. Please wait a minute."
                    : "Invalid email or password.",
                );
              router.replace("/admin");
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="field">
            Email address
            <input name="email" autoComplete="username" type="email" required />
          </label>
          <label className="field">
            Password
            <input
              name="password"
              autoComplete="current-password"
              type="password"
              required
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Signing in..." : "Sign in ?"}
          </button>
        </form>
        <p className="form-note" style={{ marginTop: 20 }}>
          Administrator access only. Contact your system administrator if you
          need access.
        </p>
      </div>
    </main>
  );
}
