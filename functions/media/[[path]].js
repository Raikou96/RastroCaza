export async function onRequestGet(context) {
  const { env, params } = context;

  if (!env.MEDIA_BUCKET) {
    return new Response("Bucket no configurado", { status: 500 });
  }

  const pathParts = Array.isArray(params.path)
    ? params.path
    : String(params.path || "")
        .split("/")
        .filter(Boolean);
  const key = pathParts.join("/");

  if (!key) {
    return new Response("Ruta no válida", { status: 400 });
  }

  const object = await env.MEDIA_BUCKET.get(key);
  if (!object) {
    return new Response("No encontrado", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(object.body, {
    headers
  });
}
