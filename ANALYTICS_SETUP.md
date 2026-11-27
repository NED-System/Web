# Guía Rápida de Conexión: Analítica, Cookies y Segmentación en Colombia (10 min)

Tu sitio web ya cuenta con:
- **Banner y modal de consentimiento** compatible con **Google Consent Mode v2** y **Ley 1581 de 2012 (Colombia)**.
- **Bloqueo previo real:** Google Analytics 4, Google Ads, Meta Pixel y Microsoft Clarity solo se cargan si el visitante acepta la categoría correspondiente.
- **Eventos de negocio listos:** segmentación *Negocios vs. Consumidores*, uso del *Simulador Plan de Puntos*, descarga de *Flyers*, clics a *Android/iOS*, *Web App*, *Planes* y envíos del formulario de *Contacto* (`generate_lead`), además de captura automática de UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `gclid`, `fbclid`).

---

## Paso 1: Crear tus cuentas e IDs (gratis)

1. **Google Analytics 4 (GA4)**
   - Entra a [analytics.google.com](https://analytics.google.com/) → *Administrar* → *Crear propiedad* (Zona horaria: Colombia, Moneda: COP).
   - Crea un **Flujo de datos Web** con tu dominio `https://ned.com.co`.
   - Copia el **ID de medición** (formato `G-XXXXXXXXXX`).

2. **Microsoft Clarity** *(Mapas de calor y grabaciones de pantalla)*
   - Entra a [clarity.microsoft.com](https://clarity.microsoft.com/) e inicia sesión.
   - Crea un nuevo proyecto para `https://ned.com.co`.
   - En *Settings → Overview*, copia tu **Project ID** (ej. `abcd1234ef`).
   - *(Tip)* En Clarity puedes vincular tu cuenta de Google Analytics para cruzar datos.

3. **Meta Pixel (Instagram y Facebook Ads)** *(Clave para pymes en Colombia)*
   - Entra al Administrador de Eventos de Meta ([business.facebook.com/events_manager2](https://business.facebook.com/events_manager2)).
   - *Conectar orígenes de datos → Web → Meta Pixel*.
   - Copia el **ID del Pixel** (número de 15–16 dígitos).

4. **Google Ads** *(Opcional, cuando lances pauta en Búsqueda o YouTube)*
   - En Google Ads ve a *Herramientas → Administrador de etiquetas / Conversión* o vincula directamente tu propiedad de GA4 en *Administrador → Vinculación con productos → Google Analytics (GA4)*.
   - Si usas etiqueta directa de Google Ads, copia tu ID `AW-XXXXXXXXXX`.

---

## Paso 2: Pegar los IDs en el proyecto

Abre el archivo [`js/analytics.js`](./js/analytics.js) y edita el bloque `NED_ANALYTICS_CONFIG` al inicio:

```js
const NED_ANALYTICS_CONFIG = {
  ga4MeasurementId: "G-TU_ID_REAL",
  googleAdsId: "AW-TU_ID_REAL",     // Déjalo como está si aún no usas Google Ads directo
  metaPixelId: "TU_PIXEL_ID_REAL",
  clarityProjectId: "TU_CLARITY_ID",
  tiktokPixelId: "",
  debug: false,
};
```

> **Nota:** Mientras un campo conserve su placeholder (`G-XXXXXXXXXX`, `AW-XXXXXXXXXX`, etc.), `analytics.js` no intentará cargarlo, evitando errores de consola o red.

---

## Paso 3: Probar todo antes de publicar

1. Abre tu sitio en el navegador agregando `?ned_debug=1` a la URL (por ejemplo: `http://localhost:5500/index.html?ned_debug=1` o `https://ned.com.co/?ned_debug=1`).
2. Abre la consola de desarrollador (`F12` → *Console*).
3. Verifica:
   - Al entrar por primera vez aparece el banner de cookies y en consola se registra `Consentimiento` denegado por defecto.
   - Haz clic en **"Aceptar todas"** y verás en consola que se cargan GA4, Clarity y Meta Pixel.
   - Navega a *Negocios*, *Planes* o el *Simulador Plan de Puntos* y verifica los logs `[NED Analytics] Evento "..."`.
   - Haz clic en **"Configurar cookies"** en el pie de página para comprobar que el usuario puede cambiar o revocar su elección en cualquier momento.

---

## Paso 4: Configurar audiencias para captar negocios en Colombia

### En Google Analytics 4 + Google Ads
En GA4 (*Administrar → Visualización de datos → Eventos*), marca como **Eventos clave (Conversiones)**:
- `generate_lead` (envío del formulario de contacto)
- `use_simulador_puntos` (dueños de negocio que calcularon su plan de puntos)
- `click_download_app`

Luego, en *Administrar → Audiencias → Nueva audiencia*, crea estas 3 audiencias de remarketing (y asegúrate de haber vinculado GA4 con Google Ads):
1. **Negocios de alta intención sin contacto:**
   - Incluyeron `view_planes` o `view_segment_negocios` o `use_simulador_puntos`, Y **excluyeron** `generate_lead`.
2. **Interesados en POS / Multisede:**
   - Visitaron `view_integracion_pos`.
3. **Tráfico Colombia por ciudad:**
   - En *Informes → Datos demográficos → Detalles demográficos*, filtra por **País = Colombia** y desglosa por **Ciudad** (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, etc.) para concentrar tu presupuesto donde más convierten.

### En Meta Ads (Instagram / Facebook)
1. Crea un **Público Personalizado del sitio web** con personas en **Colombia** que dispararon `ViewContent` o `UseSimuladorPuntos` en los últimos 30 días (excluyendo a quienes ya dispararon `Lead`) para hacer remarketing económico.
2. Cuando tengas al menos 50–100 eventos `Lead` o `UseSimuladorPuntos`, crea un **Público Similar (Lookalike 1% - 3%) en Colombia** para que Meta busque automáticamente otros dueños de negocio parecidos.

---

## Paso 5: Panel unificado en Looker Studio (Gratis)

1. Entra a [lookerstudio.google.com](https://lookerstudio.google.com/) → *Crear → Informe*.
2. Selecciona el conector **Google Analytics** y elige tu propiedad de **NED**.
3. Agrega en una sola vista:
   - **Tarjetas KPI:** Usuarios activos en Colombia, `generate_lead`, `use_simulador_puntos`, `click_download_app`.
   - **Tabla de atribución:** Dimensión `Fuente / medio de la sesión` + `Campaña` vs. `Eventos clave` (para ver qué anuncio de Instagram o Google trae más negocios).
   - **Mapa / Tabla por ciudad en Colombia:** para decidir en qué ciudades pautar primero.
