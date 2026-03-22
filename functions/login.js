import { html } from "./_lib/auth.js";

export function onRequest() {
  return html(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acceso · RastroCaza</title>
  <style>
    :root {
      color-scheme: light;
      --forest: #1f3a2a;
      --forest-soft: #355944;
      --sand: #f4efe6;
      --ink: #18201a;
      --muted: #607164;
      --accent: #c96f3e;
      --white: #fffdf8;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at top left, rgba(201,111,62,.22), transparent 28%),
        radial-gradient(circle at bottom right, rgba(31,58,42,.2), transparent 34%),
        linear-gradient(160deg, #d8ccb7 0%, #f3eee4 50%, #e8ddcc 100%);
      color: var(--ink);
    }
    .card {
      width: min(100%, 420px);
      padding: 28px;
      border-radius: 28px;
      background: rgba(255,253,248,.92);
      border: 1px solid rgba(31,58,42,.08);
      box-shadow: 0 24px 60px rgba(31,58,42,.18);
    }
    h1 {
      margin: 0 0 8px;
      font-family: Georgia, serif;
      color: var(--forest);
      font-size: 2rem;
    }
    p {
      margin: 0 0 18px;
      color: var(--muted);
      line-height: 1.45;
    }
    form {
      display: grid;
      gap: 14px;
    }
    label {
      display: grid;
      gap: 8px;
      font-weight: 700;
    }
    input {
      min-height: 52px;
      padding: 14px 16px;
      border-radius: 18px;
      border: 1px solid rgba(24,32,26,.12);
      background: var(--white);
      font: inherit;
    }
    button {
      min-height: 54px;
      border: 0;
      border-radius: 999px;
      background: linear-gradient(135deg, var(--accent), #a84d27);
      color: white;
      font: inherit;
      font-weight: 800;
      cursor: pointer;
    }
    .error {
      color: #a84d27;
      font-weight: 700;
      min-height: 1.2rem;
    }
  </style>
</head>
<body>
  <main class="card">
    <h1>RastroCaza</h1>
    <p>Accede con tu usuario y contraseña para usar la app y subir imágenes al bucket.</p>
    <form id="login-form">
      <label>
        Usuario
        <input id="username" name="username" autocomplete="username" required>
      </label>
      <label>
        Contraseña
        <input id="password" name="password" type="password" autocomplete="current-password" required>
      </label>
      <p class="error" id="login-error"></p>
      <button type="submit">Entrar</button>
    </form>
  </main>
  <script>
    const form = document.getElementById("login-form");
    const error = document.getElementById("login-error");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      error.textContent = "";

      const formData = new FormData(form);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password")
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        error.textContent = payload?.error || "No se pudo iniciar sesión.";
        return;
      }

      window.location.href = "/";
    });
  </script>
</body>
</html>`);
}
