const ALLOWED_FOLDERS = new Set(["hunters", "captures"]);
const MAX_FILE_SIZE = 8 * 1024 * 1024;

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.MEDIA_BUCKET) {
    return json(
      { error: "MEDIA_BUCKET no está configurado." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") || "");

  if (!(file instanceof File)) {
    return json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }

  if (!ALLOWED_FOLDERS.has(folder)) {
    return json({ error: "Carpeta de destino no válida." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return json({ error: "Solo se permiten imágenes." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return json(
      { error: "La imagen supera el tamaño máximo permitido de 8 MB." },
      { status: 400 }
    );
  }

  const extension = getExtension(file);
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const key = `${folder}/${year}/${month}/${crypto.randomUUID()}.${extension}`;

  await env.MEDIA_BUCKET.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type
    },
    customMetadata: {
      originalName: file.name || "image"
    }
  });

  return json({
    key,
    url: `/media/${key}`
  });
}

function getExtension(file) {
  const mimeMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
  };

  if (mimeMap[file.type]) {
    return mimeMap[file.type];
  }

  const nameParts = String(file.name || "").split(".");
  return nameParts.length > 1 ? nameParts.pop().toLowerCase() : "bin";
}

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {})
    }
  });
}
