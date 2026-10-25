// Dev: backend on port 3001. Production (single server): same origin as the website.
export const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "" : "http://localhost:3001");

export const assetUrl = (file) => {
  if (!file) return "";
  if (/^https?:\/\//.test(file)) return file; // Cloudinary (production)
  return `${API_URL}/assets/${file}`; // local development
};

let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

export async function request(path, { method = "GET", token, body, form, signal } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload, signal });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 401 && token && unauthorizedHandler) unauthorizedHandler();
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const timeAgo = (iso) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
};
