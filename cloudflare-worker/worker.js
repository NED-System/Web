/**
 * Cloudflare Worker: NED Contact Form Handler via Resend API
 * 
 * Reenvía de forma segura los mensajes del formulario de contacto
 * a info@ned.mobi sin exponer la API Key de Resend en el frontend.
 * 
 * Variables de entorno requeridas en Cloudflare Worker:
 * - RESEND_API_KEY: Clave de API de Resend (formato: re_xxxxxxxx)
 * - DESTINATION_EMAIL: info@ned.mobi (opcional, por defecto es info@ned.mobi)
 * - SENDER_EMAIL: Correo verificado en Resend (ej: "NED Contacto <contacto@ned.mobi>" o "onboarding@resend.dev")
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

export default {
  async fetch(request, env) {
    // 1. Manejo de preflight CORS (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // 2. Solo permitir método POST
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Método no permitido" }),
        {
          status: 405,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    try {
      const data = await request.json();

      // 3. Protección Honeypot (trampa para bots antispam)
      // Si el campo invisible 'website_hp' tiene texto, es un bot: respondemos éxito falso
      if (data.website_hp && data.website_hp.trim() !== "") {
        return new Response(
          JSON.stringify({ success: true, message: "Mensaje procesado con éxito" }),
          {
            status: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      }

      // 4. Extracción y sanitización de campos
      const nombre = (data.nombre || "").trim();
      const email = (data.email || "").trim();
      const telefono = (data.telefono || "").trim();
      const motivo = (data.motivo || "Contacto General").trim();
      const mensaje = (data.mensaje || "").trim();

      // 5. Validaciones básicas en el servidor
      if (!nombre || nombre.length < 2) {
        return new Response(
          JSON.stringify({ success: false, error: "Por favor proporciona un nombre válido." }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return new Response(
          JSON.stringify({ success: false, error: "Por favor proporciona un correo electrónico válido." }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      if (!mensaje || mensaje.length < 5) {
        return new Response(
          JSON.stringify({ success: false, error: "El mensaje debe tener al menos 5 caracteres." }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      // 6. Configuración de Resend
      const resendApiKey = env.RESEND_API_KEY;
      if (!resendApiKey) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Error de configuración en el servidor (Falta RESEND_API_KEY en variables de entorno).",
          }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const destinationEmail = env.DESTINATION_EMAIL || "info@ned.mobi";
      // Si tu dominio no está verificado en Resend aún, puedes usar "onboarding@resend.dev"
      const senderEmail = env.SENDER_EMAIL || "NED Web Contacto <contacto@ned.mobi>";

      // 7. Plantilla HTML profesional del correo
      const fechaHora = new Date().toLocaleString("es-CO", {
        timeZone: "America/Bogota",
        dateStyle: "full",
        timeStyle: "medium",
      });

      const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #2b2d42 0%, #1e293b 100%); padding: 30px; text-align: center; border-bottom: 4px solid #c4227d; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; }
    .badge { display: inline-block; background-color: #c4227d; color: #ffffff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-top: 8px; letter-spacing: 0.5px; }
    .content { padding: 30px; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .data-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .data-table td.label { font-weight: 700; color: #64748b; width: 35%; background-color: #f8fafc; border-radius: 6px; }
    .data-table td.value { color: #0f172a; font-weight: 500; }
    .message-box { background-color: #f8fafc; border-left: 4px solid #c4227d; border-radius: 4px; padding: 18px 20px; font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-wrap; margin-bottom: 24px; }
    .footer { text-align: center; padding: 20px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    .action-btn { display: inline-block; background-color: #c4227d; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nuevo Mensaje de Contacto</h1>
      <span class="badge">${motivo}</span>
    </div>
    <div class="content">
      <table class="data-table">
        <tr>
          <td class="label">Remitente</td>
          <td class="value"><strong>${nombre}</strong></td>
        </tr>
        <tr>
          <td class="label">Correo</td>
          <td class="value"><a href="mailto:${email}" style="color: #c4227d; text-decoration: underline;">${email}</a></td>
        </tr>
        <tr>
          <td class="label">Teléfono / WhatsApp</td>
          <td class="value">${telefono ? telefono : "<em>No proporcionado</em>"}</td>
        </tr>
        <tr>
          <td class="label">Fecha y Hora</td>
          <td class="value">${fechaHora}</td>
        </tr>
      </table>

      <h3 style="color: #2b2d42; font-size: 15px; margin-bottom: 8px;">Mensaje del Cliente:</h3>
      <div class="message-box">${mensaje}</div>

      <div style="text-align: center;">
        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(motivo)} - NED" class="action-btn">Responder a ${nombre}</a>
      </div>
    </div>
    <div class="footer">
      Este correo fue generado automáticamente por el formulario de contacto web de NED (ned.mobi / ned.com.co).
    </div>
  </div>
</body>
</html>
      `;

      // 8. Llamada a la API de Resend
      const resendPayload = {
        from: senderEmail,
        to: [destinationEmail],
        reply_to: email,
        subject: `[Contacto Web NED] ${motivo} - ${nombre}`,
        html: htmlContent,
      };

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resendPayload),
      });

      const resendResult = await resendResponse.json();

      if (!resendResponse.ok) {
        console.error("Resend API Error:", resendResult);
        return new Response(
          JSON.stringify({
            success: false,
            error: resendResult.message || "Error al enviar el correo a través de Resend.",
          }),
          { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      // 9. Éxito
      return new Response(
        JSON.stringify({
          success: true,
          message: "¡Mensaje enviado con éxito! Nos comunicaremos contigo pronto.",
          id: resendResult.id,
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );

    } catch (err) {
      console.error("Worker Error:", err);
      return new Response(
        JSON.stringify({ success: false, error: "Error interno procesando la solicitud." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
  },
};
