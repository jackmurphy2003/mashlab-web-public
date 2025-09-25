export async function serverFetch(path: string, init: RequestInit = {}) {
  const base = process.env.NEXT_PUBLIC_BACKEND_BASE!;
  const headers = new Headers(init.headers || {});
  headers.set("x-ml-preview-secret", process.env.PREVIEW_SHARED_SECRET!);
  headers.set("content-type", headers.get("content-type") || "application/json");
  
  const res = await fetch(`${base}${path}`, { ...init, headers });
  return res;
}
