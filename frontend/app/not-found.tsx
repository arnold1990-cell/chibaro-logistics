import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container section">
      <h1>Let’s get you back on route.</h1>
      <p>This page could not be found.</p>
      <Link className="button" href="/">
        Back to home
      </Link>
    </section>
  );
}
