# Cloudflare Worker para Formulario de Contacto NED con Resend

Este Worker recibe las solicitudes del formulario web y las envía por correo a `info@ned.mobi` usando la API de [Resend](https://resend.com), manteniendo tu clave de API 100% segura.

---

## Opción A: Despliegue en 2 minutos desde el Panel de Cloudflare (Sin instalar nada)

1. Inicia sesión en tu cuenta de [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. En el menú lateral, ve a **Compute (Workers & Pages)** -> **Workers** -> **Create application** -> **Create Worker**.
3. Nómbralo (por ejemplo: `ned-contact-worker`) y haz clic en **Deploy**.
4. Haz clic en **Edit code**, borra el código de ejemplo y pega todo el contenido de `worker.js`. Haz clic en **Deploy**.
5. Ve a la pestaña **Settings** del Worker -> **Variables and Secrets**:
   - Haz clic en **Add variable / Add secret**.
   - Nombre: `RESEND_API_KEY`
   - Tipo: **Secret** (cifrado)
   - Valor: Tu API key de Resend (inicia por `re_...`).
   - (Opcional): Puedes agregar la variable `SENDER_EMAIL` con el remitente configurado en tu dominio de Resend (ej. `NED Contacto <contacto@ned.mobi>`), o si aún estás verificando el dominio, `onboarding@resend.dev`.
6. Copia la URL de tu Worker (ejemplo: `https://ned-contact-worker.tu-usuario.workers.dev`).
7. Pega esa URL en `js/contacto.js` en la constante `WORKER_ENDPOINT`.

---

## Opción B: Despliegue con CLI (Wrangler)

1. Abre tu terminal en este directorio (`cloudflare-worker`):
   ```bash
   cd cloudflare-worker
   ```
2. Inicia sesión con Cloudflare:
   ```bash
   npx wrangler login
   ```
3. Registra tu clave secreta de Resend:
   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```
   *(Ingresa tu clave de Resend `re_...` cuando te lo solicite)*
4. Publica el worker:
   ```bash
   npx wrangler deploy
   ```
5. Copia la URL generada y colócala en `js/contacto.js`.
