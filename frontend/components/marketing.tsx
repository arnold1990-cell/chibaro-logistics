"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Empty, type Row } from "./admin";
export function Marketing({ section }: { section: string }) {
  const cache = useQueryClient();
  const { data: posts = [], error } = useQuery({
    queryKey: ["posts"],
    queryFn: () => api<Row[]>("/admin/marketing/posts"),
  });
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => api<Row[]>("/admin/campaigns"),
  });
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [view, setView] = useState("month");
  async function action(path: string, body?: unknown) {
    setBusy(true);
    setMessage("");
    try {
      await api(path, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      await cache.invalidateQueries();
      setMessage("Changes saved.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (section === "social-accounts") return <SocialAccounts />;
  if (section === "marketing-calendar") {
    const first = new Date(month + "-01T12:00:00");
    const count = new Date(
      first.getFullYear(),
      first.getMonth() + 1,
      0,
    ).getDate();
    return (
      <div className="panel">
        <h2>Content calendar</h2>
        <div className="admin-actions">
          <input
            type="month"
            aria-label="Calendar month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <select
            aria-label="Calendar view"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option value="month">Monthly overview</option>
            <option value="week">First week</option>
          </select>
          <Link className="button" href="/admin/ai-marketing/create">
            Create advertisement &rarr;
          </Link>
        </div>
        <p className="form-note">
          Dates are displayed in your device timezone. Only saved scheduled
          dates appear.
        </p>
        <div className="calendar">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <strong key={d}>{d}</strong>
          ))}
          {Array.from({ length: first.getDay() }, (_, i) => (
            <div key={"blank" + i} />
          ))}
          {Array.from(
            {
              length:
                view === "week" ? Math.min(7 - first.getDay(), count) : count,
            },
            (_, i) => {
              const day = month + "-" + String(i + 1).padStart(2, "0");
              return (
                <div className="calendar-cell" key={day}>
                  <strong>{i + 1}</strong>
                  {posts
                    .filter((p) => p.scheduled_at?.slice(0, 10) === day)
                    .map((p) => (
                      <Link key={p.id} href="/admin/ai-marketing">
                        {p.heading} / {p.status}
                      </Link>
                    ))}
                </div>
              );
            },
          )}
        </div>
        {!posts.some((p) => p.scheduled_at) && (
          <Empty
            title="Your calendar is ready."
            text="Approve a campaign and advertisement, then connect an eligible publishing account. Direct publishing is currently disabled."
          />
        )}
      </div>
    );
  }
  if (section === "campaigns")
    return (
      <>
        <div className="panel">
          <h2>Create a campaign</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              action("/admin/campaigns", Object.fromEntries(f));
            }}
          >
            <label className="field">
              Campaign name
              <input name="name" required maxLength={150} />
            </label>
            <label className="field">
              Campaign instructions and approved scope
              <textarea
                name="instructions"
                required
                maxLength={2000}
                rows={3}
              />
            </label>
            <button className="button" disabled={busy}>
              Save campaign
            </button>
          </form>
          <p role="status">{message}</p>
        </div>
        <div className="panel">
          <h2>Campaigns</h2>
          {campaigns.length ? (
            campaigns.map((c) => (
              <div key={c.id} className="admin-actions">
                <strong>{c.name}</strong>
                <span className="badge">
                  {c.approved ? "APPROVED" : "REQUIRES APPROVAL"}
                </span>
                {!c.approved && (
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() =>
                      action("/admin/campaigns/" + c.id + "/approve")
                    }
                  >
                    Approve campaign
                  </button>
                )}
              </div>
            ))
          ) : (
            <Empty
              title="Plan your first campaign."
              text="Describe the services and verified areas you want to promote."
            />
          )}
        </div>
      </>
    );
  if (section === "ai-marketing/create" || selected)
    return (
      <Editor
        key={selected?.id || "new"}
        selected={selected}
        campaigns={campaigns}
        onClose={() => setSelected(null)}
      />
    );
  const visible =
    section === "published-posts"
      ? posts.filter((p) => p.status === "PUBLISHED")
      : posts;
  return (
    <>
      <div className="panel">
        <h2>Make your next connection.</h2>
        <p>
          Create advertisements using verified company information, review every
          claim and approve content before publication.
        </p>
        <div className="admin-actions">
          <Link className="button" href="/admin/ai-marketing/create">
            Create advertisement &rarr;
          </Link>
          <Link href="/admin/campaigns">Manage campaigns &rarr;</Link>
          <Link href="/admin/marketing-calendar">Open calendar &rarr;</Link>
        </div>
        <Usage />
      </div>
      {error && <p className="error">{error.message}</p>}
      <div className="panel">
        <h2>
          {section === "published-posts"
            ? "Published advertisements"
            : "Advertisement library"}
        </h2>
        {visible.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Advertisement</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id}>
                    <td>{p.heading}</td>
                    <td>{p.platform}</td>
                    <td>
                      <span className="badge">{p.status}</span>
                    </td>
                    <td>
                      <button onClick={() => setSelected(p)}>
                        Review / edit &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="A blank page. A new opportunity."
            text="Saved advertisements will appear here. No posts have been published by this application."
          />
        )}
      </div>
      <Jobs />
    </>
  );
}
function Usage() {
  const { data } = useQuery({
    queryKey: ["usage"],
    queryFn: () =>
      api<{ provider: string; monthlyLimit: number; used: number }>(
        "/admin/ai/usage",
      ),
  });
  return data ? (
    <p className="notice">
      AI provider: {data.provider} / {data.used} / {data.monthlyLimit} monthly
      generation attempts. This is a request cap; configure a monetary budget
      with your provider.
    </p>
  ) : null;
}
function Editor({
  selected,
  campaigns,
  onClose,
}: {
  selected: Row | null;
  campaigns: Row[];
  onClose: () => void;
}) {
  const cache = useQueryClient();
  const [heading, setHeading] = useState(selected?.heading || "");
  const [caption, setCaption] = useState(selected?.caption || "");
  const [hashtags, setHashtags] = useState(selected?.hashtags || "");
  const [platform, setPlatform] = useState(selected?.platform || "FACEBOOK");
  const [campaignId, setCampaignId] = useState(selected?.campaign_id || "");
  const [instructions, setInstructions] = useState(
    "Advertise general cargo transport and household removal services around Beitbridge.",
  );
  const [message, setMessage] = useState("");
  const [id, setId] = useState(selected?.id || "");
  const [status, setStatus] = useState(selected?.status || "DRAFT");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(!selected);
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      await cache.invalidateQueries();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="panel">
        <h2>AI advertisement creator</h2>
        <p className="form-note">
          Only verified business claims are allowed. No unapproved prices,
          guarantees, discounts or destinations.
        </p>
        <label className="field">
          Creative brief: service, audience, tone and duration
          <textarea
            value={instructions}
            maxLength={2000}
            rows={3}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </label>
        <button
          className="button"
          disabled={busy}
          onClick={() =>
            run(async () => {
              const result = await api<{ id: string }>(
                "/admin/ai/content/generate",
                {
                  method: "POST",
                  body: JSON.stringify({ instructions, platform }),
                },
              );
              const posts = await api<Row[]>("/admin/marketing/posts");
              const draft = posts.find((p) => p.id === result.id);
              if (draft) {
                setId(draft.id);
                setHeading(draft.heading);
                setCaption(draft.caption);
                setHashtags(draft.hashtags);
                setCampaignId("");
                setStatus("DRAFT");
                setDirty(false);
              }
              setMessage(
                "Generated draft saved. Review every claim before approval.",
              );
            })
          }
        >
          {busy ? "Working..." : "Generate AI draft"}
        </button>
        <Usage />
      </div>
      <div className="editor">
        <section className="panel">
          <h2>Content editor</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                const result = await api<{ id: string }>(
                  "/admin/marketing/posts" + (id ? "/" + id : ""),
                  {
                    method: id ? "PATCH" : "POST",
                    body: JSON.stringify({
                      heading,
                      caption,
                      hashtags,
                      platform,
                      campaignId: campaignId || null,
                    }),
                  },
                );
                setId(result.id);
                setStatus("DRAFT");
                setDirty(false);
                setMessage(
                  "Draft saved. Editing clears any previous approval.",
                );
              });
            }}
          >
            <label className="field">
              Platform
              <select
                value={platform}
                onChange={(e) => {
                  setPlatform(e.target.value);
                  setDirty(true);
                }}
              >
                {["FACEBOOK", "INSTAGRAM", "LINKEDIN", "POSTER"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Campaign
              <select
                value={campaignId}
                onChange={(e) => {
                  setCampaignId(e.target.value);
                  setDirty(true);
                }}
              >
                <option value="">No campaign</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Advertisement heading
              <input
                required
                maxLength={200}
                value={heading}
                onChange={(e) => {
                  setHeading(e.target.value);
                  setDirty(true);
                }}
              />
            </label>
            <label className="field">
              Caption and call to action
              <textarea
                required
                rows={6}
                maxLength={5000}
                value={caption}
                onChange={(e) => {
                  setCaption(e.target.value);
                  setDirty(true);
                }}
              />
            </label>
            <label className="field">
              Hashtags
              <input
                maxLength={1000}
                value={hashtags}
                onChange={(e) => {
                  setHashtags(e.target.value);
                  setDirty(true);
                }}
              />
            </label>
            <p className="form-note">
              Approved photography and image upload workflow are not configured.
              This editor currently creates text drafts.
            </p>
            <div className="admin-actions">
              <button className="button" disabled={busy}>
                Save draft
              </button>
              {selected && (
                <button type="button" onClick={onClose}>
                  Back to library
                </button>
              )}
            </div>
          </form>
          {id && (
            <>
              <span className="badge">{status}</span>
              <div className="admin-actions">
                <button
                  className="button"
                  disabled={busy || dirty || status !== "DRAFT"}
                  onClick={() =>
                    run(async () => {
                      await api("/admin/marketing/posts/" + id + "/approve", {
                        method: "POST",
                      });
                      setStatus("APPROVED");
                      setMessage(
                        "Content approved. A verified connected account and campaign approval are still required for scheduling.",
                      );
                    })
                  }
                >
                  Approve reviewed content
                </button>
              </div>
              <p className="notice">
                Integration setup required. Scheduling is blocked until direct
                publishing eligibility has been verified.
              </p>
            </>
          )}
          {message && <p role="status">{message}</p>}
        </section>
        <section className="panel">
          <h2>Post preview</h2>
          <div className="preview-post">
            <span className="eyebrow">TRANSCHIBARO LOGISTICS ? {platform}</span>
            <h3 style={{ marginTop: 20 }}>
              {heading || "Your headline goes here"}
            </h3>
            <p>
              {caption ||
                "Write a caption or generate a draft to see your advertisement."}
            </p>
            <p style={{ color: "#af4a13" }}>{hashtags}</p>
          </div>
          <p className="form-note">
            Preview only. This is not a live social media post.
          </p>
        </section>
      </div>
    </>
  );
}
function SocialAccounts() {
  const { data, error } = useQuery({
    queryKey: ["social"],
    queryFn: () =>
      api<{ accounts: Row[]; status: string }>("/admin/social/accounts"),
  });
  return (
    <>
      <div className="panel">
        <h2>Connected social accounts</h2>
        <p>
          Connect company-owned accounts through official OAuth when onboarding
          is enabled. Never provide social media passwords.
        </p>
        {error && <p className="error">{error.message}</p>}
        {data?.accounts.map((a) => (
          <p key={a.id}>
            {a.provider}: {a.display_name} / {a.status}
          </p>
        ))}
      </div>
      <div className="kpis">
        {["Facebook", "Instagram", "LinkedIn", "TikTok"].map((p) => (
          <div className="panel" key={p}>
            <h3>{p}</h3>
            <p className="notice">Integration setup required</p>
            <p className="form-note">
              Official API credentials, platform permissions, OAuth onboarding
              and end-to-end verification are required. Direct publishing is
              disabled.
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
function Jobs() {
  const { data = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => api<Row[]>("/admin/publishing/jobs"),
  });
  return (
    <div className="panel">
      <h2>Publishing queue</h2>
      {data.length ? (
        data.map((j) => (
          <p key={j.id}>
            {j.status} / {j.run_at} / {j.last_error || "No error recorded"}
          </p>
        ))
      ) : (
        <Empty
          title="No publishing jobs."
          text="Approved, eligible scheduled advertisements will appear here."
        />
      )}
    </div>
  );
}
