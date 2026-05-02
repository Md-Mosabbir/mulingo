/**
 * REST client for Mulingo backend ({ success, data } envelope).
 * Auth login route returns a flat shape — handle separately in App.
 */

function baseUrl() {
  const b = import.meta.env.VITE_API_BASE_URL || "";
  return b.replace(/\/$/, "");
}

export function getStoredToken() {
  return localStorage.getItem("token");
}

export function authHeaders(token = getStoredToken()) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const opts = {
    method,
    headers: authHeaders(token ?? getStoredToken()),
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const payload = await parseBody(res);

  if (!res.ok) {
    const msg =
      payload.message ||
      payload.error ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, payload);
  }

  if (payload && payload.success === false) {
    throw new ApiError(payload.message || "Request failed", res.status, payload);
  }

  return payload.data !== undefined ? payload.data : payload;
}

export function socketOrigin() {
  return baseUrl();
}
