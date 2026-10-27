import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Admin } from "@/components/admin";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Business workspace",
  robots: { index: false, follow: false },
};
export default async function AdminPage({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section } = await params;
  const jar = await cookies();
  let response: Response;
  try {
    response = await fetch(
      (process.env.BACKEND_URL || "http://localhost:8080") + "/api/v1/auth/me",
      { headers: { Cookie: jar.toString() }, cache: "no-store" },
    );
  } catch {
    return (
      <main className="admin">
        <div className="admin-login">
          <h1>Workspace unavailable</h1>
          <p>
            The backend is not reachable. Check service health and try again.
          </p>
          <Link href="/admin">Retry</Link>
        </div>
      </main>
    );
  }
  if (!response.ok) redirect("/admin/login");
  const user = await response.json();
  return <Admin section={(section || []).join("/")} email={user.email} />;
}
