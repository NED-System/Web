document.addEventListener('DOMContentLoaded', () => {
    // ---- Referencias DOM del Editor ----
    const inputBusinessName = document.getElementById('biz_name');
    const inputBusinessUser = document.getElementById('biz_user');
    const selectBadge = document.getElementById('biz_badge');
    const containerCustomBadge = document.getElementById('custom_badge_container');
    const inputBadgeCustom = document.getElementById('biz_badge_custom');
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
    const flyerBadgeDisplay = document.getElementById('flyer_badge_display');
    const flyerCta = document.getElementById('flyer_cta');
    const flyerQrImg = document.getElementById('flyer_qr_img');
    const flyerQrPlaceholder = document.getElementById('flyer_qr_placeholder');
    
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
    updateFlyerBadge();
    updateFlyerCta();
    generateQrCode();

    // ---- Actualizaciones de Texto en Tiempo Real ----
    inputBusinessName.addEventListener('input', updateFlyerTitle);
    inputBusinessUser.addEventListener('input', updateFlyerUser);
    
    if (selectBadge) {
        selectBadge.addEventListener('change', () => {
            if (selectBadge.value === 'custom') {
                containerCustomBadge.style.display = 'block';
                inputBadgeCustom.focus();
            } else {
                containerCustomBadge.style.display = 'none';
            }
            updateFlyerBadge();
        });
    }
    
    if (inputBadgeCustom) {
        inputBadgeCustom.addEventListener('input', updateFlyerBadge);
    }
    
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
        flyerTitle.textContent = text || 'Mi Negocio';
    }

    function updateFlyerUser() {
        let text = inputBusinessUser.value.trim();
        text = text.replace(/[\s@]+/g, '');
        if (inputBusinessUser.value !== text) {
            inputBusinessUser.value = text;
        }
        flyerUser.textContent = text ? text.toLowerCase() : 'minegocio';
    }

    function updateFlyerBadge() {
        if (!flyerBadgeDisplay) return;
        if (selectBadge && selectBadge.value === 'custom') {
            flyerBadgeDisplay.textContent = (inputBadgeCustom.value.trim().toUpperCase()) || '★ DESTACADO ★';
        } else if (selectBadge) {
            flyerBadgeDisplay.textContent = selectBadge.value;
        }
    }

    function updateFlyerCta() {
        if (selectCta.value === 'custom') {
            flyerCta.textContent = inputCtaCustom.value.trim().toUpperCase() || '¡ESCRIBE TU MENSAJE AQUÍ!';
        } else {
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
        qrTimeout = setTimeout(generateQrCode, 500);
    });

    function generateQrCode() {
        if (qrMode !== 'generate') return;
        
        let urlValue = inputQrLink.value.trim();
        if (!urlValue) {
            urlValue = 'https://ned.mobi/descargar';
        }
        
        const dataEncoded = encodeURIComponent(urlValue);
        generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${dataEncoded}&margin=10`;
        
        flyerQrImg.crossOrigin = 'anonymous';
        flyerQrImg.src = generatedQrUrl;
        flyerQrImg.style.display = 'block';
        flyerQrPlaceholder.style.display = 'none';
    }

    // ---- Gestión de Subida de Archivos (Foto del Negocio) ----
    dropZonePhoto.addEventListener('click', () => inputPhotoFile.click());
    
    inputPhotoFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handlePhotoFile(e.target.files[0]);
        }
    });

    setupDragAndDrop(dropZonePhoto, handlePhotoFile);

    dropZonePhoto.addEventListener('mouseenter', () => {
        dropZonePhoto.focus();
    });
    
    document.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file' && item.type.indexOf('image/') !== -1) {
                const blob = item.getAsFile();
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
        
        textPhotoName.textContent = file.name;
        imgPhotoThumb.src = url;
        barPhotoPreview.style.display = 'flex';
        containerPhotoAdjust.style.display = 'block';
        
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

    setupDragAndDrop(dropZoneQr, handleQrFile);

    function handleQrFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecciona únicamente archivos de imagen.');
            return;
        }
        qrPhotoFile = file;
        
        const url = URL.createObjectURL(file);
        
        textQrName.textContent = file.name;
        imgQrThumb.src = url;
        barQrPreview.style.display = 'flex';
        
        if (qrMode !== 'upload') {
            setQrMode('upload');
        } else {
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
            
            flyerCard.className = 'flyer_card';
            flyerCard.classList.add(`theme-${theme}`);
        });
    });

    // ---- Impresión Nativa (PDF) ----
    btnPrint.addEventListener('click', () => {
        window.print();
    });

    // ---- Exportación en Imagen de Alta Calidad (PNG a Canvas 1080x1390) ----
    btnDownload.addEventListener('click', () => {
        btnDownload.disabled = true;
        btnDownload.textContent = 'Generando imagen HD...';

        // Dimensiones HD (1080x1390 px) optimizadas para Instagram, WhatsApp, Facebook y formato carta
        const canvasWidth = 1080;
        const canvasHeight = 1390;
        
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        // Configuración de Paletas de los Temas
        const colors = {
            ned: {
                bg: '#ffffff',
                border: '#2b2d42',
                topPillBg: '#c4227d',
                topPillText: '#ffffff',
                topPillStarBg: '#ffe700',
                topPillStarText: '#2b2d42',
                title: '#2b2d42',
                userBadgeBg: '#f3f4f6',
                userBadgeText: '#2b2d42',
                photoBorder: '#2b2d42',
                badgeBg: '#ffe700',
                badgeText: '#2b2d42',
                ctaBg: '#c4227d',
                ctaText: '#ffffff',
                qrSectionBg: '#ffe700',
                qrSectionBorder: '#2b2d42',
                qrBoxBg: '#ffffff',
                qrBoxBorder: '#2b2d42',
                cornerColor: '#2b2d42',
                stepNumBg: '#c4227d',
                stepNumText: '#ffffff',
                stepText: '#2b2d42',
                footerBorder: 'rgba(43, 45, 66, 0.25)',
                storesLabel: '#4b5563',
                invertStoreIcons: false
            },
            dark: {
                bg: '#12131a',
                border: '#ffffff',
                shadowColor: '#ffe700',
                topPillBg: '#ffe700',
                topPillText: '#12131a',
                topPillStarBg: '#c4227d',
                topPillStarText: '#ffffff',
                title: '#ffffff',
                userBadgeBg: '#1c1e29',
                userBadgeText: '#ffffff',
                photoBorder: '#ffffff',
                badgeBg: '#c4227d',
                badgeText: '#ffffff',
                ctaBg: '#ffe700',
                ctaText: '#12131a',
                qrSectionBg: '#1a1c26',
                qrSectionBorder: '#ffffff',
                qrBoxBg: '#ffffff',
                qrBoxBorder: '#ffffff',
                cornerColor: '#ffe700',
                stepNumBg: '#ffe700',
                stepNumText: '#12131a',
                stepText: '#f1f5f9',
                footerBorder: 'rgba(255, 255, 255, 0.2)',
                storesLabel: '#cbd5e1',
                invertStoreIcons: true
            },
            yellow: {
                bg: '#ffe700',
                border: '#2b2d42',
                topPillBg: '#2b2d42',
                topPillText: '#ffffff',
                topPillStarBg: '#c4227d',
                topPillStarText: '#ffffff',
                title: '#2b2d42',
                userBadgeBg: '#ffffff',
                userBadgeText: '#2b2d42',
                photoBorder: '#2b2d42',
                badgeBg: '#c4227d',
                badgeText: '#ffffff',
                ctaBg: '#2b2d42',
                ctaText: '#ffffff',
                qrSectionBg: '#ffffff',
                qrSectionBorder: '#2b2d42',
                qrBoxBg: '#ffffff',
                qrBoxBorder: '#2b2d42',
                cornerColor: '#2b2d42',
                stepNumBg: '#c4227d',
                stepNumText: '#ffffff',
                stepText: '#2b2d42',
                footerBorder: 'rgba(43, 45, 66, 0.25)',
                storesLabel: '#4b5563',
                invertStoreIcons: false
            },
            minimalist: {
                bg: '#ffffff',
                border: '#0f172a',
                topPillBg: '#1e293b',
                topPillText: '#ffffff',
                topPillStarBg: '#e2e8f0',
                topPillStarText: '#1e293b',
                title: '#0f172a',
                userBadgeBg: '#f8fafc',
                userBadgeText: '#0f172a',
                photoBorder: '#0f172a',
                badgeBg: '#0f172a',
                badgeText: '#ffffff',
                ctaBg: '#0f172a',
                ctaText: '#ffffff',
                qrSectionBg: '#f8fafc',
                qrSectionBorder: '#0f172a',
                qrBoxBg: '#ffffff',
                qrBoxBorder: '#0f172a',
                cornerColor: '#0f172a',
                stepNumBg: '#0f172a',
                stepNumText: '#ffffff',
                stepText: '#0f172a',
                footerBorder: 'rgba(15, 23, 42, 0.2)',
                storesLabel: '#64748b',
                invertStoreIcons: false
            }
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
            qrImageObj.crossOrigin = 'anonymous';
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
                    console.error('No se pudo cargar la imagen del QR para exportar.');
                    resolve();
                };
            }));
        }

        // 3. Logo NED
        const logoImageObj = new Image();
        logoImageObj.src = '../assets/logo/LogoNED.png';
        imagesToLoad.push(new Promise((resolve) => { 
            logoImageObj.onload = resolve;
            logoImageObj.onerror = () => {
                logoImageObj.src = '/assets/logo/LogoNED.png';
                logoImageObj.onload = resolve;
                logoImageObj.onerror = () => resolve();
            };
        }));

        // 4. Icono NED
        const iconImageObj = new Image();
        iconImageObj.src = '../assets/logo/Logo_NED_ico.png';
        imagesToLoad.push(new Promise((resolve) => {
            iconImageObj.onload = resolve;
            iconImageObj.onerror = () => {
                iconImageObj.src = '/assets/logo/Logo_NED_ico.png';
                iconImageObj.onload = resolve;
                iconImageObj.onerror = () => resolve();
            };
        }));

        // 5. Play Store Icon
        const playStoreImageObj = new Image();
        playStoreImageObj.src = '../assets/social/android-app.png';
        imagesToLoad.push(new Promise((resolve) => {
            playStoreImageObj.onload = resolve;
            playStoreImageObj.onerror = () => {
                playStoreImageObj.src = '/assets/social/android-app.png';
                playStoreImageObj.onload = resolve;
                playStoreImageObj.onerror = () => resolve();
            };
        }));

        // 6. App Store Icon
        const appStoreImageObj = new Image();
        appStoreImageObj.src = '../assets/social/store-apple.png';
        imagesToLoad.push(new Promise((resolve) => {
            appStoreImageObj.onload = resolve;
            appStoreImageObj.onerror = () => {
                appStoreImageObj.src = '/assets/social/store-apple.png';
                appStoreImageObj.onload = resolve;
                appStoreImageObj.onerror = () => resolve();
            };
        }));

        Promise.all(imagesToLoad).then(() => {
            try {
                renderCanvas(canvas, ctx, theme, bizImageObj, qrImageObj, logoImageObj, iconImageObj, playStoreImageObj, appStoreImageObj);
                
                const link = document.createElement('a');
                link.download = `Flyer_${inputBusinessName.value.trim().replace(/\s+/g, '_') || 'Mi_Negocio'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error('Error al exportar el flyer:', err);
                alert('Hubo un error al exportar la imagen. Si usas un código QR externo, asegúrate de tener conexión a internet o intenta subir tu propio QR.');
            } finally {
                btnDownload.disabled = false;
                btnDownload.textContent = 'Descargar Imagen (PNG)';
            }
        });
    });

    // ---- Renderizado en el Canvas HD ----
    function renderCanvas(canvas, ctx, theme, bizImage, qrImage, logoImage, iconImage, playStoreImage, appStoreImage) {
        const width = canvas.width;
        const height = canvas.height;
        const borderThickness = 8;

        // 1. Fondo de la Tarjeta
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, width, height);

        // 2. Barra Superior Co-Branding / Floating Pill
        const pillY = 40;
        const pillHeight = 54;
        const pillText = 'PROGRAMA DE FIDELIZACIÓN';
        
        ctx.font = '850 24px "Outfit", Arial, sans-serif';
        const tagTextWidth = ctx.measureText(pillText).width;
        const iconSize = 36;
        const starWidth = 92;
        const pillPaddingH = 34;
        const pillContentGap = 20;
        const pillWidth = iconSize + tagTextWidth + starWidth + (pillContentGap * 2) + (pillPaddingH * 2);
        const pillX = (width - pillWidth) / 2;

        // Sombra de la píldora
        ctx.fillStyle = activeTheme === 'dark' ? '#ffffff' : '#2b2d42';
        drawRoundedRect(ctx, pillX + 6, pillY + 6, pillWidth, pillHeight, pillHeight / 2);
        ctx.fill();

        // Fondo de la píldora
        ctx.fillStyle = theme.topPillBg;
        drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
        ctx.fill();
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Icono en la píldora
        const iconDrawX = pillX + pillPaddingH;
        if (iconImage && iconImage.complete && iconImage.naturalWidth > 0) {
            ctx.drawImage(iconImage, iconDrawX, pillY + (pillHeight - iconSize) / 2, iconSize, iconSize);
        }

        // Texto central
        ctx.fillStyle = theme.topPillText;
        ctx.font = '850 23px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const textDrawX = iconDrawX + iconSize + pillContentGap;
        ctx.fillText(pillText, textDrawX, pillY + pillHeight / 2);

        // Badge estrella VIP
        const starX = textDrawX + tagTextWidth + pillContentGap;
        const starHeight = 32;
        const starY = pillY + (pillHeight - starHeight) / 2;
        ctx.fillStyle = theme.topPillStarBg;
        drawRoundedRect(ctx, starX, starY, starWidth, starHeight, starHeight / 2);
        ctx.fill();
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = theme.topPillStarText;
        ctx.font = '900 19px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ VIP ★', starX + starWidth / 2, starY + starHeight / 2);

        // 3. Título del Negocio
        ctx.fillStyle = theme.title;
        ctx.font = '900 52px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const bizNameText = inputBusinessName.value.trim().toUpperCase() || 'MI NEGOCIO';
        const titleY = pillY + pillHeight + 28;
        
        const titleLines = wrapText(ctx, bizNameText, width - 140);
        let currentY = titleY;
        
        titleLines.slice(0, 2).forEach((line) => {
            ctx.fillText(line, width / 2, currentY);
            currentY += 56;
        });

        // 3.5. Usuario del Negocio en Píldora
        const bizUserVal = inputBusinessUser.value.trim();
        const bizUserText = bizUserVal ? `@${bizUserVal.toLowerCase()}` : '@minegocio';
        
        ctx.font = '850 27px "Outfit", Arial, sans-serif';
        const userTextWidth = ctx.measureText(bizUserText).width;
        const userPillW = userTextWidth + 85;
        const userPillH = 46;
        const userPillX = (width - userPillW) / 2;
        const userPillY = currentY + 4;

        ctx.fillStyle = theme.userBadgeBg;
        drawRoundedRect(ctx, userPillX, userPillY, userPillW, userPillH, userPillH / 2);
        ctx.fill();
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Texto del usuario
        ctx.fillStyle = activeTheme === 'dark' ? '#ffe700' : theme.userBadgeText;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(bizUserText, userPillX + 22, userPillY + userPillH / 2);

        // Checkmark verificado
        const checkRadius = 14;
        const checkCenterX = userPillX + 22 + userTextWidth + 24;
        const checkCenterY = userPillY + userPillH / 2;
        
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(checkCenterX, checkCenterY, checkRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 17px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓', checkCenterX, checkCenterY + 1);

        currentY = userPillY + userPillH + 20;

        // 4. Zona de la Foto del Negocio
        const photoMargin = 60;
        const photoWidth = width - (photoMargin * 2);
        const photoHeight = Math.round(photoWidth / 2.1);
        const photoX = photoMargin;
        const photoY = currentY;
        const photoRadius = 34;

        // Sombra de la foto
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        drawRoundedRect(ctx, photoX + 8, photoY + 8, photoWidth, photoHeight, photoRadius);
        ctx.fill();

        // Contenedor de la foto
        ctx.fillStyle = activeTheme === 'dark' ? '#1e202b' : '#f8fafc';
        drawRoundedRect(ctx, photoX, photoY, photoWidth, photoHeight, photoRadius);
        ctx.fill();

        if (bizImage) {
            ctx.save();
            ctx.beginPath();
            drawRoundedRectPath(ctx, photoX, photoY, photoWidth, photoHeight, photoRadius);
            ctx.clip();

            const imgWidth = bizImage.width;
            const imgHeight = bizImage.height;
            const targetRatio = photoWidth / photoHeight;
            const imgRatio = imgWidth / imgHeight;

            let drawW, drawH, drawX, drawY;
            const offsetX = parseInt(inputPhotoOffsetX.value, 10);
            const offsetY = parseInt(inputPhotoOffsetY.value, 10);

            if (imgRatio > targetRatio) {
                drawH = photoHeight;
                drawW = photoHeight * imgRatio;
                drawX = photoX + (photoWidth - drawW) * (offsetX / 100);
                drawY = photoY;
            } else {
                drawW = photoWidth;
                drawH = photoWidth / imgRatio;
                drawX = photoX;
                drawY = photoY + (photoHeight - drawH) * (offsetY / 100);
            }

            ctx.drawImage(bizImage, drawX, drawY, drawW, drawH);
            ctx.restore();
        } else {
            // Placeholder atractivo
            ctx.fillStyle = activeTheme === 'dark' ? '#334155' : '#cbd5e1';
            ctx.beginPath();
            ctx.arc(width / 2, photoY + photoHeight / 2 - 24, 38, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = activeTheme === 'dark' ? '#ffffff' : '#2b2d42';
            ctx.font = '850 26px "Outfit", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Tu Foto o Promoción Aquí', width / 2, photoY + photoHeight / 2 + 30);

            ctx.fillStyle = '#64748b';
            ctx.font = '700 18px "Nunito", Arial, sans-serif';
            ctx.fillText('Sube una foto de tu negocio o producto estrella', width / 2, photoY + photoHeight / 2 + 62);
        }

        // Borde de la foto
        ctx.strokeStyle = theme.photoBorder;
        ctx.lineWidth = 5;
        drawRoundedRect(ctx, photoX, photoY, photoWidth, photoHeight, photoRadius);
        ctx.stroke();

        // Sticker Comercial Flotante en la esquina superior derecha
        let badgeText = '';
        if (selectBadge && selectBadge.value === 'custom') {
            badgeText = inputBadgeCustom.value.trim().toUpperCase() || '★ GANA PREMIOS ★';
        } else if (selectBadge) {
            badgeText = selectBadge.value.toUpperCase();
        } else {
            badgeText = '🎁 ¡GANA PREMIOS!';
        }

        ctx.font = '900 24px "Outfit", Arial, sans-serif';
        const badgeW = ctx.measureText(badgeText).width + 44;
        const badgeH = 46;
        const badgeX = photoX + photoWidth - badgeW - 16;
        const badgeY = photoY + 16;

        ctx.save();
        ctx.translate(badgeX + badgeW / 2, badgeY + badgeH / 2);
        ctx.rotate(-1.5 * Math.PI / 180);

        // Sombra de sticker
        ctx.fillStyle = activeTheme === 'dark' ? '#ffffff' : '#2b2d42';
        drawRoundedRect(ctx, -badgeW / 2 + 5, -badgeH / 2 + 5, badgeW, badgeH, badgeH / 2);
        ctx.fill();

        // Fondo de sticker
        ctx.fillStyle = theme.badgeBg;
        drawRoundedRect(ctx, -badgeW / 2, -badgeH / 2, badgeW, badgeH, badgeH / 2);
        ctx.fill();
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Texto del sticker
        ctx.fillStyle = theme.badgeText;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, 0, 1);
        ctx.restore();

        // 5. Llamado a la Acción Comercial (Ribbon)
        const ctaY = photoY + photoHeight + 24;
        const ctaHeight = 72;

        // Sombra del Ribbon
        ctx.fillStyle = activeTheme === 'dark' ? '#ffffff' : '#2b2d42';
        drawRoundedRect(ctx, photoX + 6, ctaY + 6, photoWidth, ctaHeight, 20);
        ctx.fill();

        // Fondo del Ribbon
        ctx.fillStyle = theme.ctaBg;
        drawRoundedRect(ctx, photoX, ctaY, photoWidth, ctaHeight, 20);
        ctx.fill();
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 4.5;
        ctx.stroke();

        let ctaText = '';
        if (selectCta.value === 'custom') {
            ctaText = inputCtaCustom.value.trim().toUpperCase() || '¡ACUMULA PUNTOS Y GANA PREMIOS!';
        } else {
            ctaText = selectCta.options[selectCta.selectedIndex].text.toUpperCase();
        }

        ctx.fillStyle = theme.ctaText;
        ctx.font = '900 29px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const ctaLines = wrapText(ctx, ctaText, photoWidth - 40);
        if (ctaLines.length === 1) {
            ctx.fillText(ctaLines[0], width / 2, ctaY + ctaHeight / 2);
        } else {
            ctx.fillText(ctaLines[0], width / 2, ctaY + ctaHeight / 2 - 14);
            ctx.fillText(ctaLines[1], width / 2, ctaY + ctaHeight / 2 + 16);
        }

        // 6. Sección de Conversión: Código QR + Pasos Visuales
        const qrSecY = ctaY + ctaHeight + 26;
        const qrSecHeight = 350;
        const qrSecRadius = 34;

        // Sombra de sección QR
        ctx.fillStyle = activeTheme === 'dark' ? theme.shadowColor : '#2b2d42';
        drawRoundedRect(ctx, photoX + 8, qrSecY + 8, photoWidth, qrSecHeight, qrSecRadius);
        ctx.fill();

        // Fondo de sección QR
        ctx.fillStyle = theme.qrSectionBg;
        drawRoundedRect(ctx, photoX, qrSecY, photoWidth, qrSecHeight, qrSecRadius);
        ctx.fill();
        ctx.strokeStyle = theme.qrSectionBorder;
        ctx.lineWidth = 5;
        ctx.stroke();

        // QR Box a la izquierda
        const qrSize = 210;
        const qrBoxX = photoX + 30;
        const qrBoxY = qrSecY + 30;

        // Esquinas de escaneo [ ]
        const cornerLen = 22;
        const cornerOffset = 8;
        const cLeft = qrBoxX - cornerOffset;
        const cRight = qrBoxX + qrSize + cornerOffset;
        const cTop = qrBoxY - cornerOffset;
        const cBottom = qrBoxY + qrSize + cornerOffset;

        ctx.strokeStyle = theme.cornerColor;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';

        // Esquina sup-izq
        ctx.beginPath();
        ctx.moveTo(cLeft, cTop + cornerLen);
        ctx.lineTo(cLeft, cTop);
        ctx.lineTo(cLeft + cornerLen, cTop);
        ctx.stroke();

        // Esquina sup-der
        ctx.beginPath();
        ctx.moveTo(cRight - cornerLen, cTop);
        ctx.lineTo(cRight, cTop);
        ctx.lineTo(cRight, cTop + cornerLen);
        ctx.stroke();

        // Esquina inf-izq
        ctx.beginPath();
        ctx.moveTo(cLeft, cBottom - cornerLen);
        ctx.lineTo(cLeft, cBottom);
        ctx.lineTo(cLeft + cornerLen, cBottom);
        ctx.stroke();

        // Esquina inf-der
        ctx.beginPath();
        ctx.moveTo(cRight - cornerLen, cBottom);
        ctx.lineTo(cRight, cBottom);
        ctx.lineTo(cRight, cBottom - cornerLen);
        ctx.stroke();

        // Contenedor blanco para QR
        ctx.fillStyle = theme.qrBoxBg;
        drawRoundedRect(ctx, qrBoxX, qrBoxY, qrSize, qrSize, 18);
        ctx.fill();
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Dibujar el Código QR
        if (qrImage && qrImage.src) {
            ctx.drawImage(qrImage, qrBoxX + 10, qrBoxY + 10, qrSize - 20, qrSize - 20);
        } else {
            ctx.fillStyle = '#9ca3af';
            ctx.font = 'bold 18px "Nunito", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('CÓDIGO QR', qrBoxX + qrSize / 2, qrBoxY + qrSize / 2);
        }

        // Etiqueta pill abajo del QR
        const labelW = 180;
        const labelH = 34;
        const labelX = qrBoxX + (qrSize - labelW) / 2;
        const labelY = qrBoxY + qrSize + 20;

        ctx.fillStyle = activeTheme === 'dark' ? '#ffe700' : '#2b2d42';
        drawRoundedRect(ctx, labelX, labelY, labelW, labelH, labelH / 2);
        ctx.fill();

        ctx.fillStyle = activeTheme === 'dark' ? '#12131a' : '#ffffff';
        ctx.font = '900 17px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📷 ESCANEA AQUÍ', labelX + labelW / 2, labelY + labelH / 2);

        // 3 Pasos de Beneficio a la derecha
        const stepsX = qrBoxX + qrSize + 40;
        const stepsWidth = (photoX + photoWidth) - stepsX - 25;
        
        const steps = [
            { num: '1', text: 'Escanea el QR o descarga NEDLEAL' },
            { num: '2', text: 'Acumula puntos en cada compra o visita' },
            { num: '3', text: '¡Canjea increíbles regalos y descuentos!' }
        ];

        let stepY = qrSecY + 36;
        const stepNumRadius = 22;

        steps.forEach(step => {
            // Número circular
            ctx.fillStyle = theme.stepNumBg;
            ctx.beginPath();
            ctx.arc(stepsX + stepNumRadius, stepY + stepNumRadius, stepNumRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = theme.border;
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = theme.stepNumText;
            ctx.font = '900 22px "Outfit", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(step.num, stepsX + stepNumRadius, stepY + stepNumRadius + 1);

            // Texto del paso
            ctx.fillStyle = theme.stepText;
            ctx.font = '750 22px "Nunito", Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            const lines = wrapText(ctx, step.text, stepsWidth - (stepNumRadius * 2 + 15));
            if (lines.length === 1) {
                ctx.fillText(lines[0], stepsX + stepNumRadius * 2 + 16, stepY + stepNumRadius);
            } else {
                ctx.fillText(lines[0], stepsX + stepNumRadius * 2 + 16, stepY + stepNumRadius - 10);
                ctx.fillText(lines[1], stepsX + stepNumRadius * 2 + 16, stepY + stepNumRadius + 14);
            }

            stepY += 66;
        });

        // Línea divisoria inferior
        const footerY = qrSecY + 265;
        ctx.strokeStyle = theme.footerBorder;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(stepsX, footerY);
        ctx.lineTo(photoX + photoWidth - 30, footerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Footer dentro de la sección: Logo NED + Tiendas de apps
        const logoDrawY = footerY + 16;
        let logoW = 90;
        if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
            const logoH = 38;
            logoW = (logoImage.width / logoImage.height) * logoH;
            ctx.drawImage(logoImage, stepsX, logoDrawY, logoW, logoH);
        } else {
            ctx.fillStyle = activeTheme === 'dark' ? '#ffffff' : '#c4227d';
            ctx.font = '900 28px "Outfit", Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('NED', stepsX, logoDrawY + 19);
            logoW = ctx.measureText('NED').width;
        }

        // Tiendas a la derecha
        const storesStartX = stepsX + logoW + 22;
        ctx.fillStyle = theme.storesLabel;
        ctx.font = '800 18px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('Gratis en:', storesStartX, logoDrawY + 19);
        const labelTextW = ctx.measureText('Gratis en:').width;

        const storeIconH = 34;
        const icon1X = storesStartX + labelTextW + 14;
        const icon2X = icon1X + storeIconH + 10;

        if (playStoreImage && playStoreImage.complete && playStoreImage.naturalWidth > 0) {
            ctx.drawImage(playStoreImage, icon1X, logoDrawY + 2, storeIconH, storeIconH);
        }
        if (appStoreImage && appStoreImage.complete && appStoreImage.naturalWidth > 0) {
            ctx.drawImage(appStoreImage, icon2X, logoDrawY + 2, storeIconH, storeIconH);
        }

        // 7. Borde General Exterior del Cartel
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = borderThickness * 2;
        ctx.strokeRect(0, 0, width, height);
    }

    // ---- Funciones Auxiliares del Canvas ----
    function wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    function drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        drawRoundedRectPath(ctx, x, y, width, height, radius);
        ctx.closePath();
    }

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
