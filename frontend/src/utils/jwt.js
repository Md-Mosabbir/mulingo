/** Read signed-in user id from JWT payload (backend signs `{ id, email, username }`). */
export function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getUserIdFromToken(token) {
  const p = parseJwtPayload(token);
  const id = p?.id;
  return Number.isFinite(Number(id)) ? Number(id) : null;
}
