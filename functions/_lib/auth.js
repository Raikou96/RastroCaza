const SESSION_COOKIE = "rastrocaza_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export async function createSessionCookie(username, secret) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${username}.${expiresAt}`;
  const signature = await signValue(payload, secret);
  const value = `${payload}.${signature}`;

  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function verifySession(request, secret) {
  const cookies = parseCookies(request.headers.get("cookie") || "");
  const token = cookies[SESSION_COOKIE];
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length < 3) {
    return null;
  }

  const signature = parts.pop();
  const payload = parts.join(".");
  const expectedSignature = await signValue(payload, secret);
  if (signature !== expectedSignature) {
    return null;
  }

  const [username, expiresAt] = payload.split(".");
  if (!username || !expiresAt) {
    return null;
  }

  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    username,
    expiresAt: Number(expiresAt)
  };
}

export async function signValue(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toHex(signature);
}

export function parseCookies(cookieHeader) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, current) => {
      const [name, ...rest] = current.split("=");
      accumulator[name] = decodeURIComponent(rest.join("="));
      return accumulator;
    }, {});
}

export function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {})
    }
  });
}

export function html(body, init = {}) {
  return new Response(body, {
    ...init,
    headers: {
      "content-type": "text/html; charset=utf-8",
      ...(init.headers || {})
    }
  });
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
