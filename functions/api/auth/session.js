import { json, verifySession } from "../../_lib/auth.js";

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!env.AUTH_SECRET) {
    return json({ authenticated: false }, { status: 500 });
  }

  const session = await verifySession(request, env.AUTH_SECRET);
  if (!session) {
    return json({ authenticated: false }, { status: 401 });
  }

  return json({
    authenticated: true,
    username: session.username
  });
}
