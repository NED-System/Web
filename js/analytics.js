/**
 * NED - Consentimiento de Cookies (Consent Mode v2) + Analítica y Segmentación
 *
 * INSTRUCCIONES RÁPIDAS (ver guía completa en /ANALYTICS_SETUP.md):
 * 1. Reemplaza los placeholders abajo con tus IDs reales de GA4, Google Ads,
 *    Meta Pixel y Microsoft Clarity.
 * 2. Mientras un ID mantenga su placeholder (ej. 'G-XXXXXXXXXX') o esté vacío,
 *    no se inyectará ese proveedor para evitar errores en consola o red.
 * 3. Para probar en desarrollo o producción sin afectar datos, abre cualquier
 *    página con ?ned_debug=1 y revisa la consola del navegador.
 */

(function () {
  "use strict";

  // ===========================================================================
  // 1. CONFIGURACIÓN DE PROVEEDORES (Pega aquí tus IDs reales)
  // ===========================================================================
  const NED_ANALYTICS_CONFIG = {
    ga4MeasurementId: "G-L9DY49R3S6",      // Google Analytics 4
    googleAdsId: "AW-18599698449",         // Google Ads
    metaPixelId: "1175119764946971",       // Meta Pixel (Instagram/Facebook Ads)
    clarityProjectId: "zkaimy66uj",        // Microsoft Clarity (mapas de calor)
    tiktokPixelId: "",                     // Opcional para futuro (ej. "CXXXXXXXXXXXX")
    debug: false,                          // O usa ?ned_debug=1 en la URL
  };

  const PLACEHOLDERS = new Set([
    "",
    "G-XXXXXXXXXX",
    "AW-XXXXXXXXXX",
    "000000000000000",
    "XXXXXXXXXX",
  ]);

  const STORAGE_KEY = "ned_cookie_consent_v1";
  const UTM_STORAGE_KEY = "ned_utm_attribution";
  const CONSENT_VERSION = 1;

  const isDebug =
    NED_ANALYTICS_CONFIG.debug ||
    new URLSearchParams(window.location.search).get("ned_debug") === "1" ||
    safeLocalGet("ned_analytics_debug") === "1";

  const loadedProviders = {
    gtag: false,
    ga4Configured: false,
    adsConfigured: false,
    meta: false,
    clarity: false,
    tiktok: false,
  };

  let currentConsent = null;

  function logDebug() {
    if (!isDebug || typeof console === "undefined") return;
    console.log("[NED Analytics]", ...arguments);
  }

  function isConfigured(id) {
    return typeof id === "string" && !PLACEHOLDERS.has(id.trim());
  }

  function safeLocalGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function safeLocalSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (_) {
      // Ignorar si el almacenamiento está restringido
    }
  }

  function safeSessionGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function safeSessionSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (_) {
      // Ignorar
    }
  }

  function getBasePath() {
    const path = window.location.pathname || "/";
    if (path.includes("/pages/")) {
      return path.replace(/\/pages\/.*$/, "/");
    }
    if (path.includes("/b/")) {
      return path.replace(/\/b\/.*$/, "/");
    }
    return "/";
  }

  // ===========================================================================
  // 2. GOOGLE CONSENT MODE V2 (Estado inicial denegado antes de cargar tags)
  // ===========================================================================
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });

  // ===========================================================================
  // 3. ATRIBUCIÓN Y CAPTURA DE UTMs
  // ===========================================================================
  function captureUtmAttribution() {
    const params = new URLSearchParams(window.location.search);
    const keys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
    ];

    let existing = {};
    try {
      const raw = safeSessionGet(UTM_STORAGE_KEY);
      if (raw) existing = JSON.parse(raw) || {};
    } catch (_) {
      existing = {};
    }

    let hasNew = false;
    keys.forEach((key) => {
      const val = params.get(key);
      if (val) {
        existing[key] = val;
        hasNew = true;
      }
    });

    if (!existing.initial_referrer && document.referrer) {
      try {
        const refHost = new URL(document.referrer).hostname;
        if (refHost && refHost !== window.location.hostname) {
          existing.initial_referrer = refHost;
          hasNew = true;
        }
      } catch (_) {
        // Ignorar referrer inválido
      }
    }

    if (hasNew) {
      safeSessionSet(UTM_STORAGE_KEY, JSON.stringify(existing));
    }

    return existing;
  }

  const utmAttribution = captureUtmAttribution();

  // ===========================================================================
  // 4. PERSISTENCIA Y APLICACIÓN DE CONSENTIMIENTO
  // ===========================================================================
  function readSavedConsent() {
    try {
      const raw = safeLocalGet(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== CONSENT_VERSION) return null;
      return {
        version: CONSENT_VERSION,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        essential: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
      };
    } catch (_) {
      return null;
    }
  }

  function saveConsent(preferences) {
    const payload = {
      version: CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
      essential: true,
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
    };

    safeLocalSet(STORAGE_KEY, JSON.stringify(payload));
    document.cookie = `ned_consent=1; max-age=15552000; path=/; SameSite=Lax`;
    currentConsent = payload;
    applyConsent(payload);
    return payload;
  }

  function applyConsent(consent) {
    currentConsent = consent;

    window.gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
    });

    logDebug("Consentimiento aplicado:", consent);

    if (consent.analytics) {
      loadAnalyticsProviders();
    }

    if (consent.marketing) {
      loadMarketingProviders();
    }
  }

  // ===========================================================================
  // 5. CARGA DINÁMICA DE PROVEEDORES (Solo tras consentimiento explícito)
  // ===========================================================================
  function ensureGtagScript(primaryId) {
    if (loadedProviders.gtag || !isConfigured(primaryId)) return;
    loadedProviders.gtag = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryId)}`;
    document.head.appendChild(script);

    window.gtag("js", new Date());
    logDebug("gtag.js inyectado con ID:", primaryId);
  }

  function loadAnalyticsProviders() {
    const ga4Id = NED_ANALYTICS_CONFIG.ga4MeasurementId;
    if (isConfigured(ga4Id) && !loadedProviders.ga4Configured) {
      ensureGtagScript(ga4Id);
      window.gtag("config", ga4Id, {
        anonymize_ip: true,
        page_path: window.location.pathname,
      });
      loadedProviders.ga4Configured = true;
      logDebug("GA4 configurado:", ga4Id);
    }

    const clarityId = NED_ANALYTICS_CONFIG.clarityProjectId;
    if (isConfigured(clarityId) && !loadedProviders.clarity) {
      loadedProviders.clarity = true;
      (function (c, l, a, r, i, t, y) {
        c[a] =
          c[a] ||
          function () {
            (c[a].q = c[a].q || []).push(arguments);
          };
        t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0];
        if (y && y.parentNode) {
          y.parentNode.insertBefore(t, y);
        } else {
          l.head.appendChild(t);
        }
      })(window, document, "clarity", "script", clarityId);
      logDebug("Microsoft Clarity cargado:", clarityId);
    }
  }

  function loadMarketingProviders() {
    const adsId = NED_ANALYTICS_CONFIG.googleAdsId;
    if (isConfigured(adsId) && !loadedProviders.adsConfigured) {
      ensureGtagScript(
        isConfigured(NED_ANALYTICS_CONFIG.ga4MeasurementId)
          ? NED_ANALYTICS_CONFIG.ga4MeasurementId
          : adsId
      );
      window.gtag("config", adsId);
      loadedProviders.adsConfigured = true;
      logDebug("Google Ads configurado:", adsId);
    }

    const metaId = NED_ANALYTICS_CONFIG.metaPixelId;
    if (isConfigured(metaId) && !loadedProviders.meta) {
      loadedProviders.meta = true;
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod
            ? n.callMethod.apply(n, arguments)
            : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        if (s && s.parentNode) {
          s.parentNode.insertBefore(t, s);
        } else {
          b.head.appendChild(t);
        }
      })(
        window,
        document,
        "script",
        "https://connect.facebook.net/en_US/fbevents.js"
      );

      window.fbq("init", metaId);
      window.fbq("track", "PageView");
      logDebug("Meta Pixel cargado:", metaId);
    }
  }

  // ===========================================================================
  // 6. API DE TRACKING UNIFICADA (window.nedTrack)
  // ===========================================================================
  function sendToMeta(eventName, params) {
    if (!currentConsent || !currentConsent.marketing || typeof window.fbq !== "function") {
      return;
    }

    if (eventName === "generate_lead") {
      window.fbq("track", "Lead", {
        content_name: params.motivo || "Contacto NED",
        content_category: "negocio_lead",
      });
      return;
    }

    if (
      eventName.startsWith("view_segment_") ||
      eventName === "view_planes" ||
      eventName === "view_integracion_pos" ||
      eventName === "view_simulador_puntos"
    ) {
      window.fbq("track", "ViewContent", {
        content_category: eventName,
        page_path: params.page_path || window.location.pathname,
      });
      return;
    }

    const customMap = {
      click_download_app: "DownloadApp",
      click_webapp_login: "OpenWebApp",
      use_simulador_puntos: "UseSimuladorPuntos",
      download_flyer: "DownloadFlyer",
      click_planes_cta: "ClickPlanesCTA",
      click_contact_cta: "ClickContactCTA",
    };

    const customName = customMap[eventName];
    if (customName) {
      window.fbq("trackCustom", customName, params);
    }
  }

  window.nedTrack = function (eventName, params) {
    if (!eventName || typeof eventName !== "string") return;

    const enrichedParams = Object.assign(
      {
        page_path: window.location.pathname,
      },
      utmAttribution,
      params || {}
    );

    const analyticsAllowed = Boolean(currentConsent && currentConsent.analytics);
    const marketingAllowed = Boolean(currentConsent && currentConsent.marketing);

    logDebug(`Evento "${eventName}"`, {
      params: enrichedParams,
      analyticsAllowed,
      marketingAllowed,
    });

    if (analyticsAllowed && isConfigured(NED_ANALYTICS_CONFIG.ga4MeasurementId)) {
      window.gtag("event", eventName, enrichedParams);
    }

    if (marketingAllowed) {
      sendToMeta(eventName, enrichedParams);
    }
  };

  // ===========================================================================
  // 7. AUTO-TRACKING DE SEGMENTOS, CTAS Y SCROLL
  // ===========================================================================
  function trackCurrentPageSegment() {
    const path = (window.location.pathname || "/").toLowerCase();

    if (path.includes("negocios")) {
      window.nedTrack("view_segment_negocios", { segment: "negocios" });
    } else if (path.includes("consumidores")) {
      window.nedTrack("view_segment_consumidores", { segment: "consumidores" });
    } else if (path.includes("planes")) {
      window.nedTrack("view_planes", { segment: "negocios" });
    } else if (path.includes("integracion-pos")) {
      window.nedTrack("view_integracion_pos", { segment: "negocios" });
    } else if (path.includes("simulador-plan-puntos")) {
      window.nedTrack("view_simulador_puntos", { segment: "negocios" });
    } else if (path.includes("compartir")) {
      window.nedTrack("view_crear_flyer", { segment: "negocios" });
    }
  }

  function setupGlobalClickTracking() {
    document.addEventListener("click", (event) => {
      const link = event.target && event.target.closest ? event.target.closest("a") : null;
      if (!link) return;

      const href = (link.getAttribute("href") || "").trim();
      if (!href) return;

      const lowerHref = href.toLowerCase();

      if (lowerHref.includes("play.google.com/store/apps")) {
        window.nedTrack("click_download_app", {
          platform: "android",
          link_text: (link.textContent || "").trim().slice(0, 60),
        });
      } else if (lowerHref.includes("apps.apple.com")) {
        window.nedTrack("click_download_app", {
          platform: "ios",
          link_text: (link.textContent || "").trim().slice(0, 60),
        });
      } else if (lowerHref.includes("app.ned.mobi")) {
        window.nedTrack("click_webapp_login", {
          link_text: (link.textContent || "").trim().slice(0, 60),
        });
      } else if (lowerHref.includes("contacto.html")) {
        let motivo = "";
        try {
          const parsed = new URL(href, window.location.origin);
          motivo = parsed.searchParams.get("motivo") || "";
        } catch (_) {
          motivo = "";
        }
        window.nedTrack("click_contact_cta", { motivo });
      } else if (lowerHref.includes("planes.html")) {
        window.nedTrack("click_planes_cta", {
          link_text: (link.textContent || "").trim().slice(0, 60),
        });
      } else if (lowerHref.includes("notion.site")) {
        window.nedTrack("click_newsletter", {
          link_text: (link.textContent || "").trim().slice(0, 60),
        });
      }
    });
  }

  function setupScrollDepthTracking() {
    const milestones = { 50: false, 90: false };

    window.addEventListener(
      "scroll",
      () => {
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;

        const pct = Math.round((window.scrollY / docHeight) * 100);
        [50, 90].forEach((mark) => {
          if (pct >= mark && !milestones[mark]) {
            milestones[mark] = true;
            window.nedTrack("scroll_depth", { percent_scrolled: mark });
          }
        });
      },
      { passive: true }
    );
  }

  // ===========================================================================
  // 8. INTERFAZ DEL BANNER Y MODAL DE PREFERENCIAS
  // ===========================================================================
  let bannerEl = null;
  let modalBackdropEl = null;
  let toggleAnalyticsEl = null;
  let toggleMarketingEl = null;

  function buildConsentUI() {
    if (document.getElementById("ned-cookie-banner")) return;

    const basePath = getBasePath();
    const privacyUrl = `${basePath}pages/privacidad.html`;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <aside
        id="ned-cookie-banner"
        class="ned-cookie-banner"
        role="region"
        aria-label="Aviso de cookies y privacidad"
        hidden
      >
        <div class="ned-cookie-banner-copy">
          <h2 class="ned-cookie-banner-title">Tu privacidad en NED</h2>
          <p class="ned-cookie-banner-text">
            Usamos cookies esenciales para el funcionamiento del sitio y, con tu permiso, cookies de analítica y marketing para mejorar la experiencia y llegar a más negocios en Colombia. Consulta nuestra
            <a class="ned-cookie-link" href="${privacyUrl}">Política de privacidad</a>.
          </p>
        </div>
        <div class="ned-cookie-banner-actions">
          <button type="button" class="ned-cookie-btn ned-cookie-btn-ghost" id="ned-cookie-customize">
            Personalizar
          </button>
          <button type="button" class="ned-cookie-btn ned-cookie-btn-secondary" id="ned-cookie-reject">
            Solo esenciales
          </button>
          <button type="button" class="ned-cookie-btn ned-cookie-btn-primary" id="ned-cookie-accept-all">
            Aceptar todas
          </button>
        </div>
      </aside>

      <div
        id="ned-cookie-modal-backdrop"
        class="ned-cookie-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ned-cookie-modal-title"
        hidden
      >
        <div class="ned-cookie-modal">
          <div class="ned-cookie-modal-header">
            <h2 id="ned-cookie-modal-title" class="ned-cookie-modal-title">
              Preferencias de cookies
            </h2>
            <button
              type="button"
              id="ned-cookie-modal-close"
              class="ned-cookie-modal-close"
              aria-label="Cerrar preferencias de cookies"
            >
              &times;
            </button>
          </div>
          <p class="ned-cookie-modal-desc">
            Elige qué categorías de cookies autorizas en NED. Puedes cambiar tu decisión en cualquier momento desde el enlace "Configurar cookies" al pie de página.
            <a class="ned-cookie-link" href="${privacyUrl}">Ver política completa</a>.
          </p>

          <div class="ned-cookie-categories">
            <div class="ned-cookie-category">
              <div class="ned-cookie-category-head">
                <h3 class="ned-cookie-category-title">Cookies esenciales</h3>
                <span class="ned-cookie-badge-fixed">Siempre activas</span>
              </div>
              <p class="ned-cookie-category-desc">
                Necesarias para recordar tu elección de privacidad, navegación básica y seguridad del sitio.
              </p>
            </div>

            <div class="ned-cookie-category">
              <div class="ned-cookie-category-head">
                <h3 class="ned-cookie-category-title">Analítica y experiencia</h3>
                <label class="ned-cookie-switch" aria-label="Activar cookies de analítica y experiencia">
                  <input type="checkbox" id="ned-toggle-analytics" />
                  <span class="ned-cookie-slider"></span>
                </label>
              </div>
              <p class="ned-cookie-category-desc">
                Nos permiten medir visitas, uso de herramientas (como el Simulador Plan de Puntos) y detectar mejoras mediante Google Analytics 4 y Microsoft Clarity.
              </p>
            </div>

            <div class="ned-cookie-category">
              <div class="ned-cookie-category-head">
                <h3 class="ned-cookie-category-title">Marketing y segmentación</h3>
                <label class="ned-cookie-switch" aria-label="Activar cookies de marketing y segmentación">
                  <input type="checkbox" id="ned-toggle-marketing" />
                  <span class="ned-cookie-slider"></span>
                </label>
              </div>
              <p class="ned-cookie-category-desc">
                Ayudan a medir campañas en Google, Instagram y Facebook para mostrar NED a comercios interesados y evitar anuncios irrelevantes.
              </p>
            </div>
          </div>

          <div class="ned-cookie-modal-footer">
            <button type="button" class="ned-cookie-btn ned-cookie-btn-secondary" id="ned-cookie-save">
              Guardar preferencias
            </button>
            <button type="button" class="ned-cookie-btn ned-cookie-btn-primary" id="ned-cookie-modal-accept-all">
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    bannerEl = document.getElementById("ned-cookie-banner");
    modalBackdropEl = document.getElementById("ned-cookie-modal-backdrop");
    toggleAnalyticsEl = document.getElementById("ned-toggle-analytics");
    toggleMarketingEl = document.getElementById("ned-toggle-marketing");

    document.getElementById("ned-cookie-accept-all").addEventListener("click", () => {
      saveConsent({ analytics: true, marketing: true });
      hideBanner();
      closeModal();
    });

    document.getElementById("ned-cookie-reject").addEventListener("click", () => {
      saveConsent({ analytics: false, marketing: false });
      hideBanner();
      closeModal();
    });

    document.getElementById("ned-cookie-customize").addEventListener("click", () => {
      openModal();
    });

    document.getElementById("ned-cookie-modal-close").addEventListener("click", closeModal);

    modalBackdropEl.addEventListener("click", (event) => {
      if (event.target === modalBackdropEl) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modalBackdropEl && !modalBackdropEl.hidden) {
        closeModal();
      }
    });

    document.getElementById("ned-cookie-save").addEventListener("click", () => {
      saveConsent({
        analytics: Boolean(toggleAnalyticsEl && toggleAnalyticsEl.checked),
        marketing: Boolean(toggleMarketingEl && toggleMarketingEl.checked),
      });
      hideBanner();
      closeModal();
    });

    document.getElementById("ned-cookie-modal-accept-all").addEventListener("click", () => {
      saveConsent({ analytics: true, marketing: true });
      hideBanner();
      closeModal();
    });
  }

  function showBanner() {
    if (bannerEl) bannerEl.hidden = false;
  }

  function hideBanner() {
    if (bannerEl) bannerEl.hidden = true;
  }

  function openModal() {
    if (!modalBackdropEl) buildConsentUI();
    const state = currentConsent || { analytics: true, marketing: true };
    if (toggleAnalyticsEl) toggleAnalyticsEl.checked = Boolean(state.analytics);
    if (toggleMarketingEl) toggleMarketingEl.checked = Boolean(state.marketing);
    modalBackdropEl.hidden = false;
  }

  function closeModal() {
    if (modalBackdropEl) modalBackdropEl.hidden = true;
  }

  window.openNedCookieSettings = openModal;

  // ===========================================================================
  // 9. INICIALIZACIÓN
  // ===========================================================================
  function init() {
    buildConsentUI();

    const saved = readSavedConsent();
    if (saved) {
      applyConsent(saved);
      hideBanner();
    } else {
      showBanner();
    }

    setupGlobalClickTracking();
    setupScrollDepthTracking();
    trackCurrentPageSegment();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
