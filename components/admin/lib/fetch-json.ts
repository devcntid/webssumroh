export async function fetchJson<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; json: T & { error?: string; issues?: { path: (string | number)[]; message: string }[] } }> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });
  const json = (await res.json().catch(() => ({}))) as T & {
    error?: string;
    issues?: { path: (string | number)[]; message: string }[];
  };
  return { ok: res.ok, status: res.status, json };
}

/** Map Zod issues to field → message. */
export function issuesToFieldErrors(
  issues?: { path: (string | number)[]; message: string }[]
): Record<string, string> {
  if (!issues?.length) return {};
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
