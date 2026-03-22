import { createSessionCookie, json } from "../../_lib/auth.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.AUTH_USERNAME || !env.AUTH_PASSWORD || !env.AUTH_SECRET) {
    return json({ error: "Faltan secretos de autenticación." }, { status: 500 });
  }

  const payload = await request.json().catch(() => null);
  const username = String(payload?.username || "");
  const password = String(payload?.password || "");

  if (username !== env.AUTH_USERNAME || password !== env.AUTH_PASSWORD) {
    return json({ error: "Credenciales incorrectas." }, { status: 401 });
  }

  const cookie = await createSessionCookie(username, env.AUTH_SECRET);

  return json(
    { ok: true, username },
    {
      headers: {
        "set-cookie": cookie
      }
    }
  );
}
