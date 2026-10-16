/**
 * Aviso de Privacidad en Mostrador - NED Leal
 * Lógica de Personalización en Tiempo Real, Pestañas, Generación de QR y Descarga en PDF
 * Ley 1581 de 2012 / Decreto 1377 de 2013 (Colombia)
 */

document.addEventListener("DOMContentLoaded", () => {
    // ---- Referencias del DOM ----
    const inputBizName = document.getElementById("biz_name");
    const inputBizNit = document.getElementById("biz_nit");
    const selectPaperSize = document.getElementById("paper_size");
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");

    // Botones de acción
    const btnPrint = document.getElementById("btn_print");
    const btnDownloadPdf = document.getElementById("btn_download_pdf");
    const btnCopyText = document.getElementById("btn_copy_text");
    const toast = document.getElementById("toast_notice");
    const toastMsg = document.getElementById("toast_message");

    // Elementos de visualización
    const bizNameDisplays = document.querySelectorAll(".display-biz-name");
    const bizNitDisplays = document.querySelectorAll(".display-biz-nit");
    const habladorSheet = document.getElementById("hablador_sheet");

    // QR Containers
    const qrContainers = document.querySelectorAll(".qr-code-placeholder");

    // Constante URL Oficial de la Política de Privacidad
    const PRIVACY_POLICY_URL = "https://ned.mobi/pages/privacidad.html";

    // ---- 1. Lectura de Parámetros URL (Deep Linking desde la App / WhatsApp) ----
    function readUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const nameParam = urlParams.get("negocio") || urlParams.get("nombre") || urlParams.get("comercio") || urlParams.get("b");
        const nitParam = urlParams.get("nit");

        if (nameParam && inputBizName) {
            inputBizName.value = decodeURIComponent(nameParam.trim());
        }
        if (nitParam && inputBizNit) {
            inputBizNit.value = decodeURIComponent(nitParam.trim());
        }
    }

    // ---- 2. Actualización de Nombre y NIT del Comercio ----
    function updateBusinessInfo() {
        const rawName = inputBizName ? inputBizName.value.trim() : "";
        const rawNit = inputBizNit ? inputBizNit.value.trim() : "";

        const displayName = rawName.length > 0 ? rawName : "[INDICAR RAZÓN SOCIAL / NOMBRE COMERCIAL DEL NEGOCIO]";
        const displayNit = rawNit.length > 0 ? ` (NIT / CC: ${rawNit})` : "";

        bizNameDisplays.forEach(el => {
            el.textContent = displayName;
        });

        bizNitDisplays.forEach(el => {
            el.textContent = displayNit;
        });
    }

    if (inputBizName) {
        inputBizName.addEventListener("input", updateBusinessInfo);
    }
    if (inputBizNit) {
        inputBizNit.addEventListener("input", updateBusinessInfo);
    }

    // ---- 3. Generación Inteligente de Código QR ----
    function generateQrCodes() {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(PRIVACY_POLICY_URL)}&margin=4`;

        qrContainers.forEach(container => {
            container.innerHTML = ""; // Limpiar

            // Si la librería QRCode.js está cargada en el navegador:
            if (typeof QRCode !== "undefined") {
                try {
                    new QRCode(container, {
                        text: PRIVACY_POLICY_URL,
                        width: 80,
                        height: 80,
                        colorDark: "#2b2d42",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.M
                    });
                    return;
                } catch (e) {
                    console.warn("Fallo en QRCode local, usando fallback por imagen:", e);
                }
            }

            // Fallback mediante elemento <img> optimizado
            const img = document.createElement("img");
            img.src = qrUrl;
            img.alt = "Código QR Política de Privacidad NED";
            img.loading = "eager";
            img.style.width = "100%";
            img.style.height = "auto";
            img.style.display = "block";
            container.appendChild(img);
        });
    }

    // ---- 4. Gestión de Pestañas / Formatos ----
    let activeTabId = "tab-hablador";

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-tab");
            if (!targetId) return;

            activeTabId = targetId;

            // Actualizar botones
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Actualizar paneles
            tabPanes.forEach(pane => {
                if (pane.id === targetId) {
                    pane.classList.add("active");
                } else {
                    pane.classList.remove("active");
                }
            });

            // Regenerar QRs en el nuevo contenedor si hiciera falta
            generateQrCodes();
        });
    });

    // ---- 5. Tamaño de Impresión del Hablador (Media Carta vs Carta) ----
    if (selectPaperSize && habladorSheet) {
        selectPaperSize.addEventListener("change", () => {
            const size = selectPaperSize.value;
            if (size === "media-carta") {
                habladorSheet.classList.add("size-media-carta");
            } else {
                habladorSheet.classList.remove("size-media-carta");
            }
        });
    }

    // ---- 6. Notificación Toast Flotante ----
    let toastTimeout = null;
    function showToast(message) {
        if (!toast || !toastMsg) return;
        toastMsg.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 3500);
    }

    // ---- 7. Acción: Imprimir Directamente (window.print) ----
    if (btnPrint) {
        btnPrint.addEventListener("click", () => {
            window.print();
        });
    }

    // ---- 8. Acción: Descargar en Archivo PDF Real ----
    if (btnDownloadPdf) {
        btnDownloadPdf.addEventListener("click", () => {
            const activePane = document.getElementById(activeTabId);
            if (!activePane) {
                window.print();
                return;
            }

            const bizName = inputBizName ? inputBizName.value.trim() : "";
            const cleanBizName = bizName.replace(/[^a-zA-Z0-9_-]/g, "_") || "Comercio";
            const fileName = `Aviso_Privacidad_NED_${cleanBizName}.pdf`;

            // Si html2pdf está disponible en la página
            if (typeof html2pdf !== "undefined") {
                const originalText = btnDownloadPdf.innerHTML;
                btnDownloadPdf.innerHTML = `<span>⏳ Generando PDF...</span>`;
                btnDownloadPdf.disabled = true;

                // Seleccionar el contenedor hijo real a imprimir
                const elementToPrint = activePane.querySelector(".hablador-sheet, .stickers-sheet, .kit-sheet") || activePane;

                const opt = {
                    margin: [8, 8, 8, 8],
                    filename: fileName,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        letterRendering: true,
                        scrollY: 0
                    },
                    jsPDF: { unit: "mm", format: "letter", orientation: "portrait" }
                };

                html2pdf().set(opt).from(elementToPrint).save()
                    .then(() => {
                        showToast("¡PDF descargado con éxito!");
                    })
                    .catch((err) => {
                        console.error("Error al exportar con html2pdf:", err);
                        showToast("Abriendo diálogo para guardar en PDF...");
                        window.print();
                    })
                    .finally(() => {
                        btnDownloadPdf.innerHTML = originalText;
                        btnDownloadPdf.disabled = false;
                    });
            } else {
                // Fallback directo a diálogo de impresión nativo
                showToast("Usa la opción 'Guardar como PDF' en tu impresora");
                window.print();
            }
        });
    }

    // ---- 9. Acción: Copiar Texto Legal al Portapapeles ----
    if (btnCopyText) {
        btnCopyText.addEventListener("click", () => {
            const rawName = inputBizName && inputBizName.value.trim().length > 0 
                ? inputBizName.value.trim().toUpperCase() 
                : "[INDICAR RAZÓN SOCIAL / NOMBRE COMERCIAL DEL NEGOCIO]";
            
            const rawNit = inputBizNit && inputBizNit.value.trim().length > 0 
                ? ` (NIT / CC: ${inputBizNit.value.trim()})` 
                : "";

            let legalText = "";

            if (activeTabId === "tab-stickers") {
                legalText = `AVISO DE PRIVACIDAD – BENEFICIOS NED
Al suministrar su cédula o teléfono en caja para acumular puntos, redimir bonos o participar en sorteos, usted autoriza el tratamiento de sus datos a ${rawName}${rawNit} y a NED SYSTEM S.A.S. (NIT 901.404.605-9) conforme a la Ley 1581 de 2012. Conozca sus derechos y consulte la política de privacidad escaneando el código QR o en https://ned.mobi (Contacto: info@ned.mobi).`;
            } else {
                legalText = `================================================================================
          AVISO DE PRIVACIDAD Y PROTECCIÓN DE DATOS PERSONALES
        PROGRAMA DE FIDELIZACIÓN Y BENEFICIOS EN PUNTO DE VENTA
================================================================================

El presente establecimiento de comercio: ${rawName}${rawNit} 
y la sociedad tecnológica NED SYSTEM S.A.S. (NIT 901.404.605 - 9, domiciliada en Sabaneta, 
Antioquia; correo: info@ned.mobi; web: https://ned.mobi), en calidad de Responsables del 
Tratamiento de Datos Personales, informan a sus clientes:

1. FINALIDAD DEL TRATAMIENTO:
Los datos personales solicitados en caja (número de documento de identidad, número de teléfono 
celular y/o nombre) serán recolectados y tratados para las siguientes finalidades legítimas:
   a) Registrar y sincronizar sus compras en la plataforma tecnológica NED.
   b) Acumular y gestionar sus puntos del programa de fidelización.
   c) Aplicar y redimir bonos de descuento y cupones comerciales.
   d) Asignar boletas digitales de participación en sorteos comerciales del establecimiento.
   e) Enviar notificaciones transaccionales y push vinculadas a su actividad con el comercio.

2. DERECHOS DEL TITULAR (HABEAS DATA - LEY 1581 DE 2012):
Como titular de la información, a usted le asisten los derechos a:
   • Conocer, actualizar y rectificar sus datos personales.
   • Solicitar prueba de la autorización otorgada.
   • Ser informado sobre el uso que se ha dado a sus datos.
   • Revocar la autorización y/o solicitar la supresión de sus datos cuando sea procedente.
   • Acceder de forma gratuita a sus datos personales tratados.

3. DATOS SENSIBLES Y MENORES DE EDAD:
Es de carácter facultativo responder preguntas sobre datos sensibles. La plataforma NED y 
nuestro programa de beneficios están dirigidos exclusivamente a mayores de 18 años; 
no se recolectan datos de niños, niñas ni adolescentes.

4. POLÍTICA DE TRATAMIENTO Y CANALES DE ATENCIÓN:
Puede consultar la Política de Tratamiento de Datos Personales completa en https://ned.mobi 
o en la aplicación móvil NED. Para consultas, reclamos o ejercer sus derechos de Habeas Data, 
puede comunicarse al correo electrónico: info@ned.mobi o ante los canales de este comercio.
================================================================================`;
            }

            navigator.clipboard.writeText(legalText).then(() => {
                showToast("¡Texto legal copiado al portapapeles!");
            }).catch(() => {
                showToast("No se pudo copiar automáticamente. Por favor selecciónalo manualmente.");
            });
        });
    }

    // Inicialización al cargar la página
    readUrlParameters();
    updateBusinessInfo();
    generateQrCodes();
});
