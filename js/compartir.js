document.addEventListener('DOMContentLoaded', () => {
    // ---- Referencias DOM del Editor ----
    const inputBusinessName = document.getElementById('biz_name');
    const inputBusinessUser = document.getElementById('biz_user');
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
    
    // Controles de Ajuste de Foto
    const containerPhotoAdjust = document.getElementById('photo_adjust_container');
    const inputPhotoOffsetX = document.getElementById('photo_offset_x');
    const inputPhotoOffsetY = document.getElementById('photo_offset_y');
    
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
    const flyerUser = document.getElementById('flyer_user');
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
    updateFlyerUser();
    updateFlyerCta();
    generateQrCode();

    // ---- Actualizaciones de Texto en Tiempo Real ----
    inputBusinessName.addEventListener('input', updateFlyerTitle);
    inputBusinessUser.addEventListener('input', updateFlyerUser);
    
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

    function updateFlyerUser() {
        let text = inputBusinessUser.value.trim();
        // Remove spaces and '@' if the user typed it manually to normalize
        text = text.replace(/[\s@]+/g, '');
        if (inputBusinessUser.value !== text) {
            inputBusinessUser.value = text;
        }
        flyerUser.textContent = text ? `@${text.toLowerCase()}` : '';
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
        containerPhotoAdjust.style.display = 'block';
        
        // Actualizar Flyer Preview
        flyerPhotoImg.src = url;
        flyerPhotoImg.style.display = 'block';
        flyerPhotoPlaceholder.style.display = 'none';
        updatePhotoOffset();
    }

    btnRemovePhoto.addEventListener('click', (e) => {
        e.stopPropagation();
        businessPhotoFile = null;
        inputPhotoFile.value = '';
        barPhotoPreview.style.display = 'none';
        containerPhotoAdjust.style.display = 'none';
        
        // Reset offsets
        inputPhotoOffsetX.value = 50;
        inputPhotoOffsetY.value = 50;
        flyerPhotoImg.style.objectPosition = '50% 50%';
        
        flyerPhotoImg.src = '';
        flyerPhotoImg.style.display = 'none';
        flyerPhotoPlaceholder.style.display = 'flex';
    });

    function updatePhotoOffset() {
        const x = inputPhotoOffsetX.value;
        const y = inputPhotoOffsetY.value;
        flyerPhotoImg.style.objectPosition = `${x}% ${y}%`;
    }

    inputPhotoOffsetX.addEventListener('input', updatePhotoOffset);
    inputPhotoOffsetY.addEventListener('input', updatePhotoOffset);

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

        // Dimensiones del canvas para una exportación nítida en tamaño carta (8.5x11)
        const canvasWidth = 850;
        const canvasHeight = 1100;
        
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

        // 4. Icono NED
        const iconImageObj = new Image();
        iconImageObj.src = '/assets/logo/Logo_NED_ico.png';
        imagesToLoad.push(new Promise((resolve) => {
            iconImageObj.onload = resolve;
            iconImageObj.onerror = () => {
                resolve();
            };
        }));

        // 5. Play Store Icon
        const playStoreImageObj = new Image();
        playStoreImageObj.src = '/assets/social/android-app.png';
        imagesToLoad.push(new Promise((resolve) => {
            playStoreImageObj.onload = resolve;
            playStoreImageObj.onerror = () => {
                resolve();
            };
        }));

        // 6. App Store Icon
        const appStoreImageObj = new Image();
        appStoreImageObj.src = '/assets/social/store-apple.png';
        imagesToLoad.push(new Promise((resolve) => {
            appStoreImageObj.onload = resolve;
            appStoreImageObj.onerror = () => {
                resolve();
            };
        }));

        Promise.all(imagesToLoad).then(() => {
            try {
                renderCanvas(canvas, ctx, theme, bizImageObj, qrImageObj, logoImageObj, iconImageObj, playStoreImageObj, appStoreImageObj);
                
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
    function renderCanvas(canvas, ctx, theme, bizImage, qrImage, logoImage, iconImage, playStoreImage, appStoreImage) {
        const width = canvas.width;
        const height = canvas.height;
        const borderThickness = 8;

        // 1. Limpiar Fondo
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, width, height);

        // 2. Banner Superior
        const bannerHeight = 125;
        ctx.fillStyle = theme.banner;
        ctx.fillRect(0, 0, width, bannerHeight);
        
        // Línea divisoria del banner
        ctx.strokeStyle = '#2b2d42';
        ctx.lineWidth = borderThickness;
        ctx.beginPath();
        ctx.moveTo(0, bannerHeight);
        ctx.lineTo(width, bannerHeight);
        ctx.stroke();

        // Texto e Icono del banner (centrados)
        ctx.fillStyle = theme.bannerText;
        ctx.font = '900 38px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '3.5px';
        
        const bannerText = 'SÍGUENOS EN NED';
        const textWidth = ctx.measureText(bannerText).width;
        const iconSize = 52;
        const gap = 28;
        const totalWidth = iconSize + gap + textWidth;
        const startX = (width - totalWidth) / 2;
        
        if (iconImage && iconImage.complete && iconImage.naturalWidth > 0) {
            ctx.drawImage(iconImage, startX, (bannerHeight - iconSize) / 2, iconSize, iconSize);
        }
        
        ctx.fillText(bannerText, startX + iconSize + gap, bannerHeight / 2);

        // 3. Título del Negocio
        ctx.fillStyle = theme.text;
        ctx.font = '900 42px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.letterSpacing = '0px';

        const bizNameText = inputBusinessName.value.trim().toUpperCase() || 'NOMBRE DE TU NEGOCIO';
        const titleY = bannerHeight + 40;
        
        // Envolver texto si es muy largo
        const titleLines = wrapText(ctx, bizNameText, width - 100);
        let currentY = titleY;
        
        // Pintar líneas del título (máximo 2 líneas)
        titleLines.slice(0, 2).forEach((line) => {
            ctx.fillText(line, width / 2, currentY);
            currentY += 48;
        });

        // 3.5. Usuario del Negocio
        const bizUserText = inputBusinessUser.value.trim() ? `@${inputBusinessUser.value.trim().toLowerCase()}` : '';
        if (bizUserText) {
            ctx.fillStyle = activeTheme === 'dark' ? theme.cta : theme.text;
            ctx.font = '800 24px "Outfit", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.letterSpacing = '0.5px';
            
            currentY -= 5;
            ctx.fillText(bizUserText, width / 2, currentY);
            currentY += 38;
        }

        // 4. Zona de la Foto (Centrada y con Object Fit: Cover)
        const photoBorderRadius = 24;
        const photoX = 50;
        const photoY = Math.max(195, currentY + 15);
        const photoWidth = width - 100;
        const photoHeight = photoWidth / 2.0; // Bloquea las medidas con la proporción 2.0/1

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

            // Dibujar imagen simulando object-fit cover con offsets del usuario
            const imgWidth = bizImage.width;
            const imgHeight = bizImage.height;
            const targetRatio = photoWidth / photoHeight;
            const imgRatio = imgWidth / imgHeight;

            let drawW, drawH, drawX, drawY;

            const offsetX = parseInt(inputPhotoOffsetX.value, 10);
            const offsetY = parseInt(inputPhotoOffsetY.value, 10);

            if (imgRatio > targetRatio) {
                // La imagen es más ancha que el contenedor
                drawH = photoHeight;
                drawW = photoHeight * imgRatio;
                drawX = photoX + (photoWidth - drawW) * (offsetX / 100);
                drawY = photoY;
            } else {
                // La imagen es más alta que el contenedor
                drawW = photoWidth;
                drawH = photoWidth / imgRatio;
                drawX = photoX;
                drawY = photoY + (photoHeight - drawH) * (offsetY / 100);
            }

            ctx.drawImage(bizImage, drawX, drawY, drawW, drawH);
            ctx.restore();
        } else {
            // Placeholder si no hay imagen
            ctx.fillStyle = '#9ca3af';
            ctx.font = 'bold 22px "Nunito", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('[ FOTO DE TU NEGOCIO ]', width / 2, photoY + photoHeight / 2);
        }

        // 5. Llamado a la Acción (CTA)
        const ctaY = 720;
        ctx.fillStyle = theme.cta;
        ctx.font = '900 32px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.letterSpacing = '0.5px';

        let ctaText = '';
        if (selectCta.value === 'custom') {
            ctaText = inputCtaCustom.value.trim() || '¡ESCÁNEAME PARA CONSEGUIR PREMIOS!';
        } else {
            ctaText = selectCta.options[selectCta.selectedIndex].text;
        }
        ctaText = ctaText.toUpperCase();

        const ctaMaxWidth = width - 100;
        const ctaLines = wrapText(ctx, ctaText, ctaMaxWidth);
        
        let linesToDraw = ctaLines.slice(0, 2);
        if (ctaLines.length > 2) {
            let secondLine = linesToDraw[1];
            while (secondLine.length > 0 && ctx.measureText(secondLine + "...").width > ctaMaxWidth) {
                secondLine = secondLine.slice(0, -1);
            }
            linesToDraw[1] = secondLine + "...";
        }

        let currentCtaY = ctaY;
        linesToDraw.forEach((line) => {
            ctx.fillText(line, width / 2, currentCtaY);
            currentCtaY += 38;
        });

        // 6. Sección de Código QR en la parte inferior
        const qrSecX = 50;
        const qrSecY = 800;
        const qrSecWidth = width - 100;
        const qrSecHeight = 230;
        const qrSecRadius = 24;

        // Fondo de sección de QR
        ctx.fillStyle = theme.qrBg;
        drawRoundedRect(ctx, qrSecX, qrSecY, qrSecWidth, qrSecHeight, qrSecRadius);
        ctx.fill();
        
        ctx.strokeStyle = activeTheme === 'dark' ? '#ffffff' : '#2b2d42';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Dibujar el Código QR
        const qrSize = 170;
        const qrX = qrSecX + 25;
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
            ctx.font = 'bold 14px "Nunito", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('CÓDIGO QR', qrX + qrSize / 2, qrY + qrSize / 2);
        }

        // Info de la App (Logo y Subtexto)
        const infoX = qrX + qrSize + 30;
        
        // 1. Subtexto
        ctx.fillStyle = theme.qrSubText;
        ctx.font = '700 15px "Nunito", Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.letterSpacing = '0px';

        const subtextLines = [
            '1. Ve a la tienda de apps de android o iOS.',
            '2. Escribe NEDLEAL.',
            '3. Regístrate.',
            '4. Busca por el nombre o usuario.',
            '5. ¡Gana de muchas maneras!'
        ];
        
        let subtextY = qrSecY + 16;
        subtextLines.forEach(line => {
            ctx.fillText(line, infoX, subtextY);
            subtextY += 21;
        });

        // 2. Footer de la Info (Logo y Tiendas lado a lado, agrupados juntos)
        const footerY = qrSecY + 162;
        let logoW = 85;
        
        // Dibujar Logo NED en el footer
        if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
            const logoH = 32;
            logoW = (logoImage.width / logoImage.height) * logoH;
            ctx.drawImage(logoImage, infoX, footerY + 2, logoW, logoH);
        } else {
            ctx.fillStyle = activeTheme === 'dark' ? '#ffffff' : 'var(--magenta)';
            ctx.font = '900 24px "Outfit", Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('NED', infoX, footerY);
            logoW = ctx.measureText('NED').width;
        }

        // Dibujar iconos de tiendas de apps (agrupados junto a la derecha del logo)
        const storeXStart = infoX + logoW + 20;
        const storeIconH = 25;
        const totalBadgesWidth = (storeIconH * 2) + 10;

        // Crear un canvas temporal (offscreen) para procesar las imágenes con fondo transparente
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = totalBadgesWidth;
        offscreenCanvas.height = storeIconH;
        const offCtx = offscreenCanvas.getContext('2d');

        // Dibujar en el canvas temporal (las imágenes se dibujan sobre fondo transparente, a=0)
        if (playStoreImage && playStoreImage.complete && playStoreImage.naturalWidth > 0) {
            offCtx.drawImage(playStoreImage, 0, 0, storeIconH, storeIconH);
        }
        if (appStoreImage && appStoreImage.complete && appStoreImage.naturalWidth > 0) {
            offCtx.drawImage(appStoreImage, storeIconH + 10, 0, storeIconH, storeIconH);
        }

        // Aplicar el filtro de escala de grises sobre los píxeles transparentes de los iconos
        try {
            const imgData = offCtx.getImageData(0, 0, totalBadgesWidth, storeIconH);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                // Solo procesar píxeles que pertenezcan a los logotipos (opacidad > 0)
                if (a > 0) {
                    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    
                    if (activeTheme === 'dark') {
                        // Invertir grises para que resalten en tema oscuro
                        gray = 255 - gray;
                        // Ajustar contraste
                        gray = gray > 120 ? 255 : gray * 1.6;
                    } else {
                        // Incrementar contraste en temas claros para oscurecerlos
                        gray = gray < 180 ? gray * 0.5 : gray;
                    }
                    
                    data[i] = gray;     // R
                    data[i + 1] = gray; // G
                    data[i + 2] = gray; // B
                }
            }
            offCtx.putImageData(imgData, 0, 0);
        } catch (e) {
            console.warn("No se pudo aplicar el filtro de escala de grises en el canvas temporal:", e);
        }

        // Pintar el canvas temporal sobre el canvas principal
        ctx.drawImage(offscreenCanvas, storeXStart, footerY + 4);

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
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    }
});
