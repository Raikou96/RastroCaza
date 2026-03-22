# RastroCaza

Base mobile-first para gestionar una cuadrilla de caza y registrar piezas abatidas durante una batida, pensada para usarse desde el teléfono incluso sin cobertura.

## Stack

- HTML5
- CSS3
- JavaScript vanilla
- `Service Worker` + `manifest.webmanifest` para modo PWA

## Qué incluye ahora

- Configuración editable de cuadrilla y batida actual
- Alta, edición y borrado de cazadores
- Registro persistente de capturas por cazador y especie
- Imagen opcional para cada cazador
- Imagen opcional para cada captura
- Resumen en tiempo real por especie y cazador líder
- Guardado de batidas en historial local
- Listado completo de batidas archivadas con filtros por fecha
- Vista detalle de cada batida archivada
- Exportación de datos a JSON
- Soporte offline y opción de instalación como app
- Subida de imágenes preparada para Cloudflare Pages Functions + R2

## Cómo abrirla

Para que el `service worker` y la instalación PWA funcionen bien, conviene servir la carpeta con un servidor estático local.

Puedes usar el servidor incluido:

`powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 4173 -Root "C:\Users\Usuario\Proyectos\RastroCaza"`

Luego abre:

`http://localhost:4173`

## Cómo probarla en un móvil

La forma más simple es servirla desde tu ordenador y abrirla desde el móvil en la misma red Wi-Fi.

Pasos:

- arranca el servidor local en tu ordenador
- averigua la IP local del ordenador, por ejemplo con `ipconfig`
- abre en el móvil `http://TU_IP:4173`
- si el navegador móvil lo permite, añade la app a pantalla de inicio

Si quieres probar la PWA de forma más fiable en Android:

- usa Chrome en el móvil
- abre la URL del servidor
- entra en el menú del navegador y pulsa `Añadir a pantalla de inicio` o `Instalar app`

## Siguiente paso recomendado

- Preparar backend y almacenamiento real de imágenes
- Añadir sincronización entre dispositivos cuando toque backend
- Incorporar despliegue web y dominio público

## Recomendación para subirla a la web

La opción que te recomiendo para esta app es [Cloudflare Pages](https://pages.cloudflare.com/).

Motivos:

- es muy buena para proyectos frontend estáticos y PWA
- despliega rápido y gratis para empezar
- tiene CDN y HTTPS sin complicaciones
- después se integra bien con backend y almacenamiento si evolucionamos la app

Alternativa muy buena:

- [Vercel](https://vercel.com/)

Cuando toque pasar de prototipo a producto, lo ideal será:

- frontend en Cloudflare Pages o Vercel
- backend/API aparte
- imágenes en almacenamiento tipo S3, Cloudflare R2 o similar

## Preparado para Cloudflare Pages

He dejado el proyecto listo para desplegar como sitio estático en Cloudflare Pages con:

- [wrangler.jsonc](C:\Users\Usuario\Proyectos\RastroCaza\wrangler.jsonc)
- [_headers](C:\Users\Usuario\Proyectos\RastroCaza\_headers)
- [_routes.json](C:\Users\Usuario\Proyectos\RastroCaza\_routes.json)
- [functions/api/upload.js](C:\Users\Usuario\Proyectos\RastroCaza\functions\api\upload.js)
- [functions/media/[[path]].js](C:\Users\Usuario\Proyectos\RastroCaza\functions\media\[[path]].js)

## Cómo desplegar en Cloudflare Pages

La opción recomendada es usar integración con Git.

Pasos:

1. Sube este proyecto a GitHub.
2. En Cloudflare Dashboard entra en `Workers & Pages`.
3. Crea un proyecto nuevo con `Pages`.
4. Elige `Connect to Git`.
5. Selecciona tu repositorio.
6. En la configuración de build usa `Build command` vacío.
7. En la configuración de build usa `Build output directory` con `.`.
8. Lanza el primer deploy.

## Alternativa: subida directa

Ahora que el proyecto usa `Pages Functions`, lo recomendable es seguir con integración Git en Cloudflare Pages.

Importante:

- Cloudflare indica que `Direct Upload` no está soportado cuando el proyecto usa `Functions`.
- En esta fase, para este proyecto, usa despliegue con Git o Wrangler.

## Qué haría después del despliegue

- Añadir un dominio propio
- Probar instalación en móvil desde la URL pública
- Configurar el bucket de imágenes en producción

## Configurar imágenes con R2

La app ya está preparada para que las imágenes de cazadores y capturas se guarden en un bucket R2.

Pasos en Cloudflare:

1. Ve a `R2` en el panel de Cloudflare.
2. Crea un bucket, por ejemplo `rastrocaza-media`.
3. Ve a tu proyecto `Pages`.
4. Entra en `Settings` > `Bindings`.
5. Pulsa `Add` > `R2 bucket`.
6. En `Variable name` pon exactamente `MEDIA_BUCKET`.
7. Selecciona el bucket que acabas de crear.
8. Guarda y vuelve a desplegar el proyecto.

Después de eso:

- `POST /api/upload` guardará la imagen en R2
- `/media/...` servirá la imagen desde Pages Functions
- la app guardará la URL de la imagen en vez de incrustarla en base64

## Importante sobre seguridad

La app ya incluye autenticación simple con usuario y contraseña.

Está implementada con:

- [functions/_middleware.js](C:\Users\Usuario\Proyectos\RastroCaza\functions\_middleware.js)
- [functions/_lib/auth.js](C:\Users\Usuario\Proyectos\RastroCaza\functions\_lib\auth.js)
- [functions/login.js](C:\Users\Usuario\Proyectos\RastroCaza\functions\login.js)
- [functions/api/auth/login.js](C:\Users\Usuario\Proyectos\RastroCaza\functions\api\auth\login.js)
- [functions/api/auth/logout.js](C:\Users\Usuario\Proyectos\RastroCaza\functions\api\auth\logout.js)
- [functions/api/auth/session.js](C:\Users\Usuario\Proyectos\RastroCaza\functions\api\auth\session.js)

## Configurar autenticación en Cloudflare Pages

En tu proyecto `Pages` ve a:

- `Settings`
- `Variables and Secrets`

Añade estos secretos:

- `AUTH_USERNAME`
- `AUTH_PASSWORD`
- `AUTH_SECRET`

Recomendación:

- `AUTH_USERNAME`: tu usuario de acceso
- `AUTH_PASSWORD`: una contraseña larga y única
- `AUTH_SECRET`: una cadena larga aleatoria para firmar la cookie de sesión

## Qué protege esta autenticación

- bloquea el acceso a la app si no hay sesión válida
- protege la subida de imágenes
- protege el acceso a las imágenes servidas por `/media/...`

## Limitación actual de esta autenticación

Esta es una autenticación simple de fase inicial.

Eso significa que:

- no hay recuperación de contraseña
- no hay gestión de múltiples usuarios desde panel
- no hay roles
- las credenciales se gestionan desde secretos del proyecto

## Limitación actual en local

El servidor local [serve.ps1](C:\Users\Usuario\Proyectos\RastroCaza\serve.ps1) sirve la app estática, pero no ejecuta Pages Functions.

Eso significa que:

- en local puedes probar la interfaz
- la subida real a R2 se prueba una vez desplegado en Cloudflare Pages
