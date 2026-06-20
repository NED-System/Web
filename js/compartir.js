document.addEventListener('DOMContentLoaded', () => {
    // ---- Referencias DOM del Editor ----
    const inputBusinessName = document.getElementById('biz_name');
    const selectCta = document.getElementById('biz_cta');
    const containerCustomCta = document.getElementById('custom_cta_container');
    const inputCtaCustom = document.getElementById('biz_cta_custom');
    
    // Controles de QR
    const btnToggleQrGenerate = document.getElementById('toggle_qr_generate');
    const btnToggleQrUpload = document.getElementById('toggle_qr_upload');
    const containerQrGenerate = document.getElementById('qr_generate_container');
    const containerQrUpload = document.getElementById('qr_upload_container');
    const inputQrLink = document.getElementById('biz_qr_link');
    const inputQrFile = document.getElementById('biz_qr_file');
    
    // Controles de Foto
    const inputPhotoFile = document.getElementById('biz_photo_file');
    const dropZonePhoto = document.getElementById('drop_zone_photo');
    const dropZoneQr = document.getElementById('drop_zone_qr');
    
    // Visualización de Archivos Seleccionados
    const barPhotoPreview = document.getElementById('photo_preview_bar');
    const textPhotoName = document.getElementById('photo_preview_name');
    const imgPhotoThumb = document.getElementById('photo_preview_thumb');
    const btnRemovePhoto = document.getElementById('btn_remove_photo');
    
    const barQrPreview = document.getElementById('qr_preview_bar');
    const textQrName = document.getElementById('qr_preview_name');
    const imgQrThumb = document.getElementById('qr_preview_thumb');
    const btnRemoveQr = document.getElementById('btn_remove_qr');
    
    // Temas y Acciones
    const themeButtons = document.querySelectorAll('.theme_btn');
    const btnDownload = document.getElementById('btn_download_png');
    const btnPrint = document.getElementById('btn_print_pdf');
    
    // ---- Referencias DOM de la Vista Previa (Flyer) ----
    const flyerCard = document.getElementById('flyer_card');
    const flyerTitle = document.getElementById('flyer_title');
    const flyerPhotoImg = document.getElementById('flyer_photo_img');
    const flyerPhotoPlaceholder = document.getElementById('flyer_photo_placeholder');
    const flyerCta = document.getElementById('flyer_cta');
    const flyerQrImg = document.getElementById('flyer_qr_img');
    const flyerQrPlaceholder = document.getElementById('flyer_qr_placeholder');
    const flyerQrSubtext = document.getElementById('flyer_qr_subtext');
    
    // ---- Variables de Estado ----
    let activeTheme = 'ned';
    let qrMode = 'generate'; // 'generate' o 'upload'
    let businessPhotoFile = null;
    let qrPhotoFile = null;
    let generatedQrUrl = '';
    let qrTimeout = null;

    // ---- Iniciar Valores por Defecto ----
    updateFlyerTitle();
    updateFlyerCta();
    generateQrCode();

    // ---- Actualizaciones de Texto en Tiempo Real ----
    inputBusinessName.addEventListener('input', updateFlyerTitle);
    
    selectCta.addEventListener('change', () => {
        if (selectCta.value === 'custom') {
            containerCustomCta.style.display = 'block';
            inputCtaCustom.focus();
        } else {
            containerCustomCta.style.display = 'none';
        }
        updateFlyerCta();
    });
    
    inputCtaCustom.addEventListener('input', updateFlyerCta);

    function updateFlyerTitle() {
        const text = inputBusinessName.value.trim();
        flyerTitle.textContent = text || 'Nombre de tu Negocio';
    }

    function updateFlyerCta() {
        if (selectCta.value === 'custom') {
            flyerCta.textContent = inputCtaCustom.value.trim() || '¡ESCRIBE TU MENSAJE!';
        } else {
            // Obtener el texto de la opción seleccionada
            const selectedOptionText = selectCta.options[selectCta.selectedIndex].text;
            flyerCta.textContent = selectedOptionText.toUpperCase();
        }
    }

    // ---- Conmutador de Modo de Código QR ----
    btnToggleQrGenerate.addEventListener('click', () => {
        setQrMode('generate');
    });

    btnToggleQrUpload.addEventListener('click', () => {
        setQrMode('upload');
    });

    function setQrMode(mode) {
        qrMode = mode;
        if (mode === 'generate') {
            btnToggleQrGenerate.classList.add('active');
            btnToggleQrUpload.classList.remove('active');
            containerQrGenerate.classList.add('active');
            containerQrUpload.classList.remove('active');
            
            // Actualizar vista previa del QR con el QR generado
            if (generatedQrUrl) {
                flyerQrImg.src = generatedQrUrl;
                flyerQrImg.style.display = 'block';
                flyerQrPlaceholder.style.display = 'none';
            } else {
                generateQrCode();
            }
        } else {
            btnToggleQrUpload.classList.add('active');
            btnToggleQrGenerate.classList.remove('active');
            containerQrUpload.classList.add('active');
            containerQrGenerate.classList.remove('active');
            
            // Actualizar vista previa del QR con el archivo subido
            if (qrPhotoFile) {
                const url = URL.createObjectURL(qrPhotoFile);
                flyerQrImg.src = url;
                flyerQrImg.style.display = 'block';
                flyerQrPlaceholder.style.display = 'none';
            } else {
                flyerQrImg.src = '';
                flyerQrImg.style.display = 'none';
                flyerQrPlaceholder.style.display = 'flex';
            }
        }
    }

    // ---- Generación Automática de QR ----
    inputQrLink.addEventListener('input', () => {
        clearTimeout(qrTimeout);
        // Debounce para evitar llamadas excesivas a la API
        qrTimeout = setTimeout(generateQrCode, 500);
    });

    function generateQrCode() {
        if (qrMode !== 'generate') return;
        
        let urlValue = inputQrLink.value.trim();
        if (!urlValue) {
            // Valor por defecto si no ingresa nada (perfil genérico o landing)
            urlValue = 'https://ned.com.co';
        }
        
        // Codificar el texto para la URL
        const dataEncoded = encodeURIComponent(urlValue);
        // Usar api.qrserver.com, agregamos cors para poder pintar en canvas
        generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${dataEncoded}&margin=10`;
        
        flyerQrImg.crossOrigin = 'anonymous'; // Clave para evitar canvas manchados (CORS)
        flyerQrImg.src = generatedQrUrl;
        flyerQrImg.style.display = 'block';
        flyerQrPlaceholder.style.display = 'none';
    }

    // ---- Gestión de Subida de Archivos (Foto del Negocio) ----
    
    // Al hacer clic en la zona, activar input file
    dropZonePhoto.addEventListener('click', () => inputPhotoFile.click());
    
    inputPhotoFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handlePhotoFile(e.target.files[0]);
        }
    });

    // Drag & Drop para Foto
    setupDragAndDrop(dropZonePhoto, handlePhotoFile);

    // Paste para Foto
    dropZonePhoto.addEventListener('mouseenter', () => {
        dropZonePhoto.focus(); // Permitir foco para escuchar el evento paste
    });
    
    // Capturar evento pegado del portapapeles
    document.addEventListener('paste', (e) => {
        // Verificar si el foco está cerca o si el usuario quiere pegar
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file' && item.type.indexOf('image/') !== -1) {
                const blob = item.getAsFile();
                
                // Si el mouse está sobre la zona de QR, o estamos en modo QR, cargarlo allí.
                const isOverQr = document.activeElement === dropZoneQr || 
                                 document.querySelector('#drop_zone_qr:hover');
                                 
                if (isOverQr || qrMode === 'upload') {
                    if (qrMode !== 'upload') setQrMode('upload');
                    handleQrFile(blob);
                } else {
                    handlePhotoFile(blob);
                }
                e.preventDefault();
                break;
            }
        }
    });

    function handlePhotoFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecciona únicamente archivos de imagen.');
            return;
        }
        businessPhotoFile = file;
        
        const url = URL.createObjectURL(file);
        
        // Actualizar UI del Editor
        textPhotoName.textContent = file.name;
        imgPhotoThumb.src = url;
        barPhotoPreview.style.display = 'flex';
        
        // Actualizar Flyer Preview
        flyerPhotoImg.src = url;
        flyerPhotoImg.style.display = 'block';
        flyerPhotoPlaceholder.style.display = 'none';
    }

    btnRemovePhoto.addEventListener('click', (e) => {
        e.stopPropagation();
        businessPhotoFile = null;
        inputPhotoFile.value = '';
        barPhotoPreview.style.display = 'none';
        
        flyerPhotoImg.src = '';
        flyerPhotoImg.style.display = 'none';
        flyerPhotoPlaceholder.style.display = 'flex';
    });

    // ---- Gestión de Subida de Archivos (Código QR) ----
    dropZoneQr.addEventListener('click', () => inputQrFile.click());
    
    inputQrFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleQrFile(e.target.files[0]);
        }
    });

    // Drag & Drop para QR
    setupDragAndDrop(dropZoneQr, handleQrFile);

    function handleQrFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecciona únicamente archivos de imagen.');
            return;
        }
        qrPhotoFile = file;
        
        const url = URL.createObjectURL(file);
        
        // Actualizar UI del Editor
        textQrName.textContent = file.name;
        imgQrThumb.src = url;
        barQrPreview.style.display = 'flex';
        
        // Forzar modo de QR subido
        if (qrMode !== 'upload') {
            setQrMode('upload');
        } else {
            // Actualizar Flyer Preview
            flyerQrImg.src = url;
            flyerQrImg.style.display = 'block';
            flyerQrPlaceholder.style.display = 'none';
        }
    }

    btnRemoveQr.addEventListener('click', (e) => {
        e.stopPropagation();
        qrPhotoFile = null;
        inputQrFile.value = '';
        barQrPreview.style.display = 'none';
        
        if (qrMode === 'upload') {
            flyerQrImg.src = '';
            flyerQrImg.style.display = 'none';
            flyerQrPlaceholder.style.display = 'flex';
        }
    });

    // ---- Función genérica Drag & Drop ----
    function setupDragAndDrop(element, callback) {
        ['dragenter', 'dragover'].forEach(eventName => {
            element.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                element.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                element.classList.remove('dragover');
            }, false);
        });

        element.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                callback(files[0]);
            }
        }, false);
    }

    // ---- Selector de Temas ----
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const theme = button.getAttribute('data-theme');
            activeTheme = theme;
            
            // Limpiar clases previas de tema en el flyer
            flyerCard.className = 'flyer_card';
            flyerCard.classList.add(`theme-${theme}`);
        });
    });

    // ---- Impresión Nativa (PDF) ----
    btnPrint.addEventListener('click', () => {
        // Ejecutar la impresión nativa. El CSS se encargará de formatearlo a pantalla completa.
        window.print();
    });

    // ---- Exportación en Imagen de Alta Calidad (PNG a Canvas) ----
    btnDownload.addEventListener('click', () => {
        // Deshabilitar botón durante la descarga
        btnDownload.disabled = true;
        btnDownload.textContent = 'Generando imagen...';

        // Dimensiones del canvas para una exportación nítida (1.5x tamaño del previsualizador)
        const canvasWidth = 720;
        const canvasHeight = 972; // Proporcional al aspect-ratio del flyer (4 / 5.4)
        
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        // Configuración de Colores de los Temas
        const colors = {
            ned: { bg: '#ffffff', banner: '#c4227d', bannerText: '#ffffff', text: '#2b2d42', cta: '#c4227d', qrBg: '#ffe700', qrSubText: '#4b5563' },
            yellow: { bg: '#ffe700', banner: '#2b2d42', bannerText: '#ffffff', text: '#2b2d42', cta: '#2b2d42', qrBg: '#ffffff', qrSubText: '#2b2d42' },
            dark: { bg: '#2b2d42', banner: '#c4227d', bannerText: '#ffffff', text: '#ffffff', cta: '#ffe700', qrBg: '#1f2937', qrSubText: '#d1d5db' },
            minimalist: { bg: '#ffffff', banner: '#2b2d42', bannerText: '#ffffff', text: '#2b2d42', cta: '#2b2d42', qrBg: '#ffffff', qrSubText: '#4b5563' }
        };

        const theme = colors[activeTheme] || colors.ned;

        // Cargar las imágenes en paralelo
        const imagesToLoad = [];
        
        // 1. Foto de negocio
        let bizImageObj = null;
        if (businessPhotoFile) {
            bizImageObj = new Image();
            bizImageObj.src = URL.createObjectURL(businessPhotoFile);
            imagesToLoad.push(new Promise((resolve) => { bizImageObj.onload = resolve; }));
        }

        // 2. Código QR
        const qrImageObj = new Image();
        if (qrMode === 'generate') {
            qrImageObj.crossOrigin = 'anonymous'; // Necesario para evitar manchar el canvas con CORS
            qrImageObj.src = generatedQrUrl;
        } else if (qrPhotoFile) {
            qrImageObj.src = URL.createObjectURL(qrPhotoFile);
        } else {
            qrImageObj.src = '';
        }
        
        if (qrImageObj.src) {
            imagesToLoad.push(new Promise((resolve) => {
                qrImageObj.onload = resolve;
                qrImageObj.onerror = () => {
                    console.error("No se pudo cargar la imagen del QR para exportar.");
                    resolve(); // Resolver para que continúe la descarga
                };
            }));
        }

        // 3. Logo NED
        const logoImageObj = new Image();
        logoImageObj.src = '/assets/logo/LogoNED.png';
        imagesToLoad.push(new Promise((resolve) => { 
            logoImageObj.onload = resolve;
            logoImageObj.onerror = () => {
                console.warn("No se pudo cargar el logo de NED. Se generará la imagen sin él.");
                resolve();
            };
        }));

        Promise.all(imagesToLoad).then(() => {
            try {
                renderCanvas(canvas, ctx, theme, bizImageObj, qrImageObj, logoImageObj);
                
                // Descargar
                const link = document.createElement('a');
                link.download = `Flyer_${inputBusinessName.value.trim().replace(/\s+/g, '_') || 'Mi_Negocio'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error("Error al exportar el flyer:", err);
                alert("Hubo un error al exportar la imagen. Si usas un código QR externo, asegúrate de tener conexión a internet o intenta subir tu propio QR.");
            } finally {
                btnDownload.disabled = false;
                btnDownload.textContent = 'Descargar Imagen (PNG)';
            }
        });
    });

    // ---- Renderizado en el Canvas ----
    function renderCanvas(canvas, ctx, theme, bizImage, qrImage, logoImage) {
        const width = canvas.width;
        const height = canvas.height;
        const borderThickness = 6;

        // 1. Limpiar Fondo
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, width, height);

        // 2. Banner Superior
        const bannerHeight = 50;
        ctx.fillStyle = theme.banner;
        ctx.fillRect(0, 0, width, bannerHeight);
        
        // Línea divisoria del banner
        ctx.strokeStyle = '#2b2d42';
        ctx.lineWidth = borderThickness;
        ctx.beginPath();
        ctx.moveTo(0, bannerHeight);
        ctx.lineTo(width, bannerHeight);
        ctx.stroke();

        // Texto del banner
        ctx.fillStyle = theme.bannerText;
        ctx.font = '900 16px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '1.5px';
        ctx.fillText('SÍGUENOS EN NED • GANA Y CRECE CON LA LEALTAD', width / 2, bannerHeight / 2);

        // 3. Título del Negocio
        ctx.fillStyle = theme.text;
        ctx.font = '900 38px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.letterSpacing = '0px';

        const bizNameText = inputBusinessName.value.trim().toUpperCase() || 'NOMBRE DE TU NEGOCIO';
        const titleY = bannerHeight + 35;
        
        // Envolver texto si es muy largo
        const titleLines = wrapText(ctx, bizNameText, width - 80);
        let currentY = titleY;
        
        // Pintar líneas del título (máximo 2 líneas)
        titleLines.slice(0, 2).forEach((line) => {
            ctx.fillText(line, width / 2, currentY);
            currentY += 44;
        });

        // 4. Zona de la Foto (Centrada y con Object Fit: Cover)
        const photoBorderRadius = 24;
        const photoX = 40;
        const photoY = 170;
        const photoWidth = width - 80;
        const photoHeight = 440;

        // Dibujar contenedor con borde
        ctx.fillStyle = activeTheme === 'dark' ? '#374151' : '#f3f4f6';
        drawRoundedRect(ctx, photoX, photoY, photoWidth, photoHeight, photoBorderRadius);
        ctx.fill();
        
        ctx.strokeStyle = activeTheme === 'dark' ? '#ffffff' : '#2b2d42';
        ctx.lineWidth = 4;
        ctx.stroke();

        if (bizImage) {
            ctx.save();
            // Crear máscara redondeada para la foto
            ctx.beginPath();
            drawRoundedRectPath(ctx, photoX + 2, photoY + 2, photoWidth - 4, photoHeight - 4, photoBorderRadius - 2);
            ctx.clip();

            // Dibujar imagen simulando object-fit cover
            const imgWidth = bizImage.width;
            const imgHeight = bizImage.height;
            const targetRatio = photoWidth / photoHeight;
            const imgRatio = imgWidth / imgHeight;

            let drawW, drawH, drawX, drawY;

            if (imgRatio > targetRatio) {
                // La imagen es más ancha que el contenedor
                drawH = photoHeight;
                drawW = photoHeight * imgRatio;
                drawX = photoX + (photoWidth - drawW) / 2;
                drawY = photoY;
            } else {
                // La imagen es más alta que el contenedor
                drawW = photoWidth;
                drawH = photoWidth / imgRatio;
                drawX = photoX;
                drawY = photoY + (photoHeight - drawH) / 2;
            }

            ctx.drawImage(bizImage, drawX, drawY, drawW, drawH);
            ctx.restore();
        } else {
            // Placeholder si no hay imagen
            ctx.fillStyle = '#9ca3af';
            ctx.font = 'bold 20px "Nunito", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('[ FOTO DE TU NEGOCIO ]', width / 2, photoY + photoHeight / 2);
        }

        // 5. Llamado a la Acción (CTA)
        const ctaY = 645;
        ctx.fillStyle = theme.cta;
        ctx.font = '900 24px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.letterSpacing = '0.5px';

        let ctaText = '';
        if (selectCta.value === 'custom') {
            ctaText = inputCtaCustom.value.trim() || '¡ESCÁNEAME PARA CONSEGUIR PREMIOS!';
        } else {
            ctaText = selectCta.options[selectCta.selectedIndex].text;
        }
        
        ctx.fillText(ctaText.toUpperCase(), width / 2, ctaY);

        // 6. Sección de Código QR en la parte inferior
        const qrSecX = 40;
        const qrSecY = 705;
        const qrSecWidth = width - 80;
        const qrSecHeight = 175;
        const qrSecRadius = 24;

        // Fondo de sección de QR
        ctx.fillStyle = theme.qrBg;
        drawRoundedRect(ctx, qrSecX, qrSecY, qrSecWidth, qrSecHeight, qrSecRadius);
        ctx.fill();
        
        ctx.strokeStyle = activeTheme === 'dark' ? '#ffffff' : '#2b2d42';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Dibujar el Código QR
        const qrSize = 135;
        const qrX = qrSecX + 20;
        const qrY = qrSecY + (qrSecHeight - qrSize) / 2;
        
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(ctx, qrX, qrY, qrSize, qrSize, 12);
        ctx.fill();
        ctx.strokeStyle = activeTheme === 'dark' ? '#ffffff' : '#2b2d42';
        ctx.lineWidth = 3;
        ctx.stroke();

        if (qrImage && qrImage.src) {
            ctx.drawImage(qrImage, qrX + 8, qrY + 8, qrSize - 16, qrSize - 16);
        } else {
            ctx.fillStyle = '#9ca3af';
            ctx.font = 'bold 12px "Nunito", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('CÓDIGO QR', qrX + qrSize / 2, qrY + qrSize / 2);
        }

        // Info de la App (Logo y Subtexto)
        const infoX = qrX + qrSize + 25;
        const infoY = qrSecY + 30;

        // Dibujar Logo NED
        if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
            // El logo original es transparente y tiene dimensiones variables.
            // Escalamos a una altura razonable (ej. 50px) manteniendo el aspect ratio
            const logoH = 50;
            const logoW = (logoImage.width / logoImage.height) * logoH;
            ctx.drawImage(logoImage, infoX, infoY, logoW, logoH);
        } else {
            // Fallback de texto de marca si no carga la imagen
            ctx.fillStyle = activeTheme === 'dark' ? '#ffffff' : 'var(--magenta)';
            ctx.font = '900 32px "Outfit", Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText('NED', infoX, infoY);
        }

        // Subtexto
        ctx.fillStyle = theme.qrSubText;
        ctx.font = 'bold 16px "Nunito", Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const subtextLines = [
            '1. Descarga la App gratis.',
            '2. Busca nuestro negocio.',
            '3. ¡Gana y acumula premios!'
        ];
        
        let subtextY = infoY + 60;
        subtextLines.forEach(line => {
            ctx.fillText(line, infoX, subtextY);
            subtextY += 24;
        });

        // 7. Borde General Exterior del Cartel
        ctx.strokeStyle = activeTheme === 'dark' ? '#ffffff' : '#2b2d42';
        ctx.lineWidth = borderThickness * 2;
        ctx.strokeRect(0, 0, width, height);
    }

    // ---- Funciones Auxiliares del Canvas ----
    
    // Divide el texto en varias líneas si excede un ancho máximo
    function wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    // Dibuja un rectángulo redondeado con borde
    function drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        drawRoundedRectPath(ctx, x, y, width, height, radius);
        ctx.closePath();
    }

    // Genera la ruta para un rectángulo redondeado
    function drawRoundedRectPath(ctx, x, y, width, height, radius) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height - radius);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    }
});
