/**
 * Contacto NED — Controlador de Formulario y Comunicación con Cloudflare Worker / Resend
 */

// =============================================================================
// CONFIGURACIÓN:
// Reemplaza esta URL con la URL asignada a tu Cloudflare Worker desplegado:
// Ejemplo: "https://ned-contact-worker.tu-subdominio.workers.dev"
// =============================================================================
const WORKER_ENDPOINT = "https://ned-contact-worker.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contacto-form");
  const submitBtn = document.getElementById("submit-btn");
  const btnText = submitBtn.querySelector(".btn_text");
  const btnSpinner = submitBtn.querySelector(".btn_spinner");
  const formAlert = document.getElementById("form-alert");
  const motivoSelect = document.getElementById("motivo");
  const openChatBtn = document.getElementById("open-chat-btn");

  // 1. Detección de parámetros URL (Pre-selección inteligente)
  // Ej: /pages/contacto.html?motivo=enterprise -> Selecciona Plan Enterprise
  const urlParams = new URLSearchParams(window.location.search);
  const motivoParam = urlParams.get("motivo");

  if (motivoParam) {
    const motivoLower = motivoParam.toLowerCase();
    if (motivoLower.includes("enterprise")) {
      motivoSelect.value = "Plan Enterprise / Soluciones Multisede";
    } else if (motivoLower.includes("pos")) {
      motivoSelect.value = "Integración POS (Facturación y Cajas)";
    } else if (motivoLower.includes("pro") || motivoLower.includes("plan")) {
      motivoSelect.value = "Dudas sobre Planes y Precios";
    }
  }

  // 2. Botón para abrir el Chat Brevo si está disponible
  if (openChatBtn) {
    openChatBtn.addEventListener("click", () => {
      if (window.BrevoConversations && typeof window.BrevoConversations === "function") {
        window.BrevoConversations("openChat", true);
      } else {
        showAlert("El widget de chat se está iniciando, o puedes escribirnos directamente a info@ned.mobi.", "info");
      }
    });
  }

  // 3. Manejo y validación del formulario
  if (form) {
    // Limpiar errores mientras el usuario escribe
    const inputs = form.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        clearFieldError(input);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Ocultar alerta previa
      hideAlert();

      // Validación completa en el cliente
      if (!validateForm(form)) {
        return;
      }

      // Trampa Honeypot: si el campo invisible fue llenado por un bot, abortar silenciosamente
      const honeypot = form.querySelector("#website_hp");
      if (honeypot && honeypot.value.trim() !== "") {
        console.warn("Honeypot detectado.");
        showAlert("¡Mensaje enviado con éxito! Nos comunicaremos contigo pronto.", "success");
        form.reset();
        return;
      }

      // Preparar carga útil (Payload)
      const formData = {
        nombre: form.querySelector("#nombre").value.trim(),
        email: form.querySelector("#email").value.trim(),
        telefono: form.querySelector("#telefono").value.trim(),
        motivo: form.querySelector("#motivo").value,
        mensaje: form.querySelector("#mensaje").value.trim(),
        website_hp: honeypot ? honeypot.value : "",
      };

      // Estado de carga en la UI
      setLoadingState(true);

      try {
        const response = await fetch(WORKER_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json().catch(() => null);

        if (response.ok && result && result.success) {
          showAlert(
            "¡Muchas gracias! Tu mensaje ha sido enviado correctamente a nuestro equipo (info@ned.mobi). Te responderemos pronto.",
            "success"
          );
          form.reset();
          // Scroll suave a la alerta
          formAlert.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
          const errorMsg =
            result && result.error
              ? result.error
              : "No pudimos enviar tu mensaje en este momento. Por favor escríbenos directamente a info@ned.mobi.";
          showAlert(errorMsg, "error");
        }
      } catch (err) {
        console.error("Error al enviar formulario:", err);
        showAlert(
          "Ocurrió un error de conexión al enviar el formulario. Por favor verifica tu conexión o contáctanos directamente a info@ned.mobi.",
          "error"
        );
      } finally {
        setLoadingState(false);
      }
    });
  }

  // --- Funciones Auxiliares de Validación y UI ---

  function validateForm(formEl) {
    let isValid = true;

    // Nombre
    const nombre = formEl.querySelector("#nombre");
    if (!nombre.value.trim() || nombre.value.trim().length < 2) {
      showFieldError(nombre, "Por favor ingresa tu nombre completo.");
      isValid = false;
    }

    // Email
    const email = formEl.querySelector("#email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
      showFieldError(email, "Ingresa un correo electrónico válido (ej. nombre@empresa.com).");
      isValid = false;
    }

    // Motivo
    const motivo = formEl.querySelector("#motivo");
    if (!motivo.value) {
      showFieldError(motivo, "Por favor selecciona el motivo de tu consulta.");
      isValid = false;
    }

    // Mensaje
    const mensaje = formEl.querySelector("#mensaje");
    if (!mensaje.value.trim() || mensaje.value.trim().length < 5) {
      showFieldError(mensaje, "Por favor escribe tu consulta con un poco más de detalle (mínimo 5 caracteres).");
      isValid = false;
    }

    return isValid;
  }

  function showFieldError(inputEl, message) {
    inputEl.classList.add("is-invalid");
    const errorEl = document.getElementById(`${inputEl.id}-error`);
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function clearFieldError(inputEl) {
    inputEl.classList.remove("is-invalid");
    const errorEl = document.getElementById(`${inputEl.id}-error`);
    if (errorEl) {
      errorEl.textContent = "";
    }
  }

  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.textContent = "Enviando mensaje...";
      btnSpinner.hidden = false;
    } else {
      submitBtn.disabled = false;
      btnText.textContent = "Enviar Mensaje";
      btnSpinner.hidden = true;
    }
  }

  function showAlert(message, type) {
    formAlert.hidden = false;
    formAlert.className = `form_alert alert_${type === "success" ? "success" : "error"}`;
    formAlert.textContent = message;
  }

  function hideAlert() {
    formAlert.hidden = true;
    formAlert.className = "form_alert";
    formAlert.textContent = "";
  }
});
