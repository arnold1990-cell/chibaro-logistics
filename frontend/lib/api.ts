export async function api<T = Record<string, unknown>>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (options.method && !["GET", "HEAD"].includes(options.method)) {
    const csrf = await fetch("/api/v1/auth/csrf", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!csrf.ok)
      throw new Error(
        "Unable to establish a secure connection. Please try again.",
      );
    const token = await csrf.json();
    headers.set(token.headerName, token.token);
  }
  const response = await fetch("/api/v1" + path, {
    ...options,
    headers,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.detail ||
        (response.status === 401
          ? "Please sign in to continue."
          : "Unable to complete this request. Please try again."),
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}
