import { verifySession } from "./_lib/auth.js";

const PUBLIC_PATHS = new Set([
  "/login",
  "/api/auth/login",
  "/api/auth/session"
]);

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  if (PUBLIC_PATHS.has(url.pathname)) {
    return next();
  }

  if (!env.AUTH_USERNAME || !env.AUTH_PASSWORD || !env.AUTH_SECRET) {
    return new Response("Faltan variables de autenticación en Cloudflare.", {
      status: 500
    });
  }

  const session = await verifySession(request, env.AUTH_SECRET);
  if (!session) {
    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/media/")) {
      return new Response("No autorizado", { status: 401 });
    }

    return Response.redirect(`${url.origin}/login`, 302);
  }

  context.data.user = session;
  return next();
}
