"use client";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { Marketing } from "@/components/marketing";
export type Row = Record<string, string>;
const navigation = [
  ["", "Dashboard"],
  ["quotes", "Quotations"],
  ["bookings", "Bookings"],
  ["customers", "Customers"],
  ["fleet", "Fleet"],
  ["services", "Services"],
  ["service-areas", "Service Areas"],
  ["ai-marketing", "AI Marketing Studio"],
  ["marketing-calendar", "Content Calendar"],
  ["social-accounts", "Social Accounts"],
  ["published-posts", "Published Posts"],
  ["campaigns", "Campaigns"],
  ["leads", "Leads"],
  ["analytics", "Analytics"],
  ["assistant", "AI Assistant"],
  ["settings", "Settings"],
];
export function Admin(props: { section: string; email: string }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <Workspace {...props} />
    </QueryClientProvider>
  );
}
function Workspace({ section, email }: { section: string; email: string }) {
  const router = useRouter();
  const title =
    navigation.find(([slug]) => slug === section)?.[1] ||
    "Advertisement creator";
  const [error, setError] = useState("");
  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <Link href="/" className="brand">
          <BrandLogo />
        </Link>
        <nav>
          {navigation.map(([slug, label]) => (
            <Link
              key={slug}
              className={section === slug ? "active" : ""}
              href={"/admin" + (slug ? "/" + slug : "")}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="admin-main" id="main">
        <header className="admin-top">
          <div>
            <span className="eyebrow">MOVING BEITBRIDGE FORWARD</span>
            <h1>{title}</h1>
            <p>{email}</p>
          </div>
          <button
            className="button"
            onClick={async () => {
              try {
                await api("/auth/logout", { method: "POST" });
                router.push("/admin/login");
                router.refresh();
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Sign out
          </button>
        </header>
        {error && <p className="error">{error}</p>}
        {section === "" || section === "analytics" ? (
          <Analytics />
        ) : [
            "quotes",
            "bookings",
            "customers",
            "fleet",
            "services",
            "service-areas",
            "leads",
          ].includes(section) ? (
          <Records section={section} />
        ) : [
            "ai-marketing",
            "ai-marketing/create",
            "marketing-calendar",
            "social-accounts",
            "published-posts",
            "campaigns",
          ].includes(section) ? (
          <Marketing section={section} />
        ) : section === "settings" ? (
          <Settings />
        ) : section === "assistant" ? (
          <div className="panel">
            <h2>Customer assistance</h2>
            <p>
              The public widget answers from verified services, areas and
              contact information. Prices, availability and bookings are always
              referred to the team. Generative conversational AI and
              conversation management are not enabled.
            </p>
            <Link className="button" href="/">
              Open public website <ArrowUpRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="panel">This workspace section is unavailable.</div>
        )}
      </main>
    </div>
  );
}
function Analytics() {
  const [days, setDays] = useState("30");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const date = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toISOString().slice(0, 10);
  };
  const query =
    days === "custom"
      ? `?from=${from || date(29)}&to=${to || date(0)}`
      : `?from=${date(Number(days) - 1)}&to=${date(0)}`;
  const { data, error, isPending } = useQuery({
    queryKey: ["analytics", query],
    queryFn: () =>
      api<Record<string, unknown>>("/admin/analytics/overview" + query),
  });
  const labels: Record<string, string> = {
    quotations: "Quotation requests",
    newEnquiries: "New enquiries",
    pendingQuotations: "Pending quotations",
    confirmedBookings: "Confirmed bookings",
    completedDeliveries: "Completed deliveries",
    scheduledAdvertisements: "Scheduled advertisements",
    publishedAdvertisements: "Published advertisements",
    failedAdvertisements: "Failed advertisements",
  };
  return (
    <>
      <div className="admin-actions">
        <label>
          Date range{" "}
          <select
            aria-label="Date range"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          >
            <option value="1">Today</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="custom">Custom dates</option>
          </select>
        </label>
        {days === "custom" && (
          <>
            <input
              type="date"
              aria-label="From date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              type="date"
              aria-label="To date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </>
        )}
      </div>
      {error ? (
        <p className="error">{error.message}</p>
      ) : isPending ? (
        <p role="status">Loading business activity...</p>
      ) : (
        <>
          <div className="kpis">
            {Object.entries(labels).map(([key, label]) => (
              <div className="kpi" key={key}>
                <span>{label}</span>
                <strong>{Number(data[key] || 0)}</strong>
              </div>
            ))}
          </div>
          <div className="panel">
            <h2>Website enquiries</h2>
            <p className="form-note">
              Counts reflect records received within the selected dates.
            </p>
            {(data.trend as { date: string; count: number }[]).length ? (
              (data.trend as { date: string; count: number }[]).map((row) => (
                <div className="bar-row" key={row.date}>
                  <span>{row.date}</span>
                  <div
                    className="bar"
                    style={{ width: Math.min(100, row.count * 10) + "%" }}
                  />
                  <strong>{row.count}</strong>
                </div>
              ))
            ) : (
              <Empty
                title="Your next enquiry starts here."
                text="Website requests will appear in this dashboard as they arrive."
              />
            )}
          </div>
          <div className="panel">
            <h2>Enquiry sources & conversion</h2>
            {(data.sources as { source: string; count: number }[]).map((r) => (
              <p key={r.source}>
                {r.source}: {r.count}
              </p>
            ))}
            <p>
              Quotation acceptance:{" "}
              {Number(data.quotations) > 0
                ? Math.round(
                    (Number(data.acceptedQuotations) /
                      Number(data.quotations)) *
                      100,
                  ) + "%"
                : "No quotations in this period"}
            </p>
          </div>
          <div className="panel">
            <h2>Social performance</h2>
            <p>
              Integration setup required. Impressions, engagement and click
              statistics are unavailable until account permissions and metric
              retrieval are verified.
            </p>
            <Link href="/admin/social-accounts" className="text-link">
              View social accounts &rarr;
            </Link>
          </div>
        </>
      )}
    </>
  );
}
export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Records({ section }: { section: string }) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const { data, error, isPending, refetch } = useQuery({
    queryKey: [section, page],
    queryFn: () => api<Row[]>("/admin/" + section + "?page=" + page),
  });
  const editable = ["quotes", "bookings", "leads"].includes(section);
  const rows = (data || []).filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
  );
  const columns =
    section === "customers"
      ? ["name", "phone", "email"]
      : section === "fleet"
        ? ["name", "capacity_kg", "active"]
        : section === "services"
          ? ["name", "description", "active"]
          : section === "service-areas"
            ? ["name", "verified"]
            : ["reference", "name", "phone", "status", "created_at"];
  return (
    <>
      <div className="panel">
        <div className="admin-actions">
          <input
            aria-label="Search current page"
            placeholder="Search this page?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="button" onClick={() => refetch()}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        {error ? (
          <p className="error">{error.message}</p>
        ) : isPending ? (
          <p role="status">Loading records...</p>
        ) : rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c}>{c.replaceAll("_", " ")}</th>
                  ))}
                  {editable && <th>Review</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((c) => (
                      <td key={c}>
                        {c === "status" ? (
                          <span className="badge">{row[c]}</span>
                        ) : (
                          String(row[c] ?? "?")
                        )}
                      </td>
                    ))}
                    {editable && (
                      <td>
                        <button
                          className="text-link"
                          onClick={() => setSelected(row)}
                        >
                          Open &rarr;
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No records to show."
            text="Requests and enquiries will appear here when received."
          />
        )}
        <div className="admin-actions">
          <button
            disabled={!page}
            onClick={() => {
              setPage(page - 1);
              setSelected(null);
            }}
          >
            ? Previous
          </button>
          <span>Page {page + 1} ? 50 records per page</span>
          <button
            disabled={(data?.length || 0) < 50}
            onClick={() => {
              setPage(page + 1);
              setSelected(null);
            }}
          >
            Next &rarr;
          </button>
        </div>
      </div>
      {selected && (
        <RecordEditor
          key={selected.id}
          row={selected}
          section={section}
          close={() => setSelected(null)}
        />
      )}
    </>
  );
}
function RecordEditor({
  row,
  section,
  close,
}: {
  row: Row;
  section: string;
  close: () => void;
}) {
  const cache = useQueryClient();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const states =
    section === "quotes"
      ? [
          "NEW",
          "UNDER_REVIEW",
          "QUOTED",
          "ACCEPTED",
          "REJECTED",
          "EXPIRED",
          "CANCELLED",
        ]
      : section === "bookings"
        ? [
            "REQUESTED",
            "PENDING_CONFIRMATION",
            "CONFIRMED",
            "SCHEDULED",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED",
          ]
        : [
            "NEW",
            "CONTACTED",
            "QUALIFIED",
            "QUOTATION_SENT",
            "CONVERTED",
            "LOST",
          ];
  return (
    <section className="panel">
      <h2>Review {row.reference}</h2>
      {row.review_required && (
        <p className="notice">
          Capacity review required. Confirm actual weight and suitable vehicle
          before proceeding.
        </p>
      )}
      <dl className="admin-details">
        {Object.entries(row)
          .filter(([k]) => !["id", "submission_key", "customer_id"].includes(k))
          .map(([k, v]) => (
            <div key={k}>
              <dt>{k.replaceAll("_", " ")}</dt>
              <dd>{String(v ?? "?")}</dd>
            </div>
          ))}
      </dl>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const f = new FormData(e.currentTarget);
          const body: Record<string, unknown> = Object.fromEntries(f);
          if (section === "quotes")
            body.price = f.get("price") ? Number(f.get("price")) : null;
          for (const key of [
            "currency",
            "vehicleId",
            "driverName",
            "followUp",
            "assignedTo",
          ])
            if (body[key] === "") body[key] = null;
          try {
            await api("/admin/" + section + "/" + row.id, {
              method: "PATCH",
              body: JSON.stringify(body),
            });
            await cache.invalidateQueries({ queryKey: [section] });
            await cache.invalidateQueries({ queryKey: ["analytics"] });
            close();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field">
          Status
          <select name="status" defaultValue={row.status}>
            {states.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        {section === "quotes" ? (
          <>
            <label className="field">
              Price
              <input
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={row.price || ""}
              />
            </label>
            <label className="field">
              Currency (ISO code)
              <input
                name="currency"
                pattern="[A-Z]{3}"
                maxLength={3}
                placeholder="e.g. USD ? confirm with customer"
                defaultValue={row.currency || ""}
              />
            </label>
            <label className="field">
              Quotation conditions
              <textarea
                name="conditions"
                rows={4}
                maxLength={5000}
                defaultValue={row.conditions || ""}
              />
            </label>
          </>
        ) : section === "bookings" ? (
          <>
            <label className="field">
              Vehicle UUID
              <input
                name="vehicleId"
                defaultValue={row.vehicle_id || ""}
                placeholder="Copy the vehicle ID from fleet records"
              />
            </label>
            <label className="field">
              Driver name (optional)
              <input name="driverName" defaultValue={row.driver_name || ""} />
            </label>
          </>
        ) : (
          <>
            <label className="field">
              Notes
              <textarea
                name="notes"
                maxLength={5000}
                defaultValue={row.notes || ""}
              />
            </label>
            <label className="field">
              Follow-up date
              <input
                name="followUp"
                type="date"
                defaultValue={row.follow_up || ""}
              />
            </label>
            <label className="field">
              Assigned administrator UUID
              <input name="assignedTo" defaultValue={row.assigned_to || ""} />
            </label>
          </>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-actions">
          <button className="button" disabled={busy}>
            Save changes
          </button>
          <button type="button" onClick={close}>
            Close
          </button>
          {section === "quotes" && row.status === "ACCEPTED" && (
            <button
              type="button"
              className="button"
              onClick={async () => {
                try {
                  const r = await api<{ reference: string }>(
                    "/admin/quotes/" + row.id + "/convert",
                    { method: "POST" },
                  );
                  setError("Booking request created: " + r.reference);
                  await cache.invalidateQueries({ queryKey: ["bookings"] });
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Convert to booking request
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
function Settings() {
  return (
    <>
      <div className="panel">
        <h2>Business information</h2>
        <p>TransChibaro Logistics / Beitbridge, Zimbabwe</p>
        <p>WhatsApp +263 77 500 8064 / Calls +263 783 051 430</p>
        <p>kamhungachibs@gmail.com</p>
        <p className="notice">
          Business catalog editing and retention settings are pending
          implementation. Configuration changes currently require a reviewed
          migration or environment update.
        </p>
      </div>
      <div className="panel">
        <h2>Administrator notifications</h2>
        <Notifications />
      </div>
    </>
  );
}
function Notifications() {
  const { data, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<Row[]>("/admin/notifications"),
  });
  return error ? (
    <p className="error">{error.message}</p>
  ) : data?.length ? (
    <ul>
      {data.map((r) => (
        <li key={r.id}>
          {r.kind} / {r.status} / {r.created_at}
        </li>
      ))}
    </ul>
  ) : (
    <p>
      No notifications yet. Requests are stored in the outbox; email delivery
      requires configuration and a delivery worker.
    </p>
  );
}
