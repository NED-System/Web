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
    const flyerPhotoAmbient = document.getElementById('flyer_photo_ambient');
    const flyerPhotoPlaceholder = document.getElementById('flyer_photo_placeholder');
    const flyerBadgeDisplay = document.getElementById('flyer_badge_display');
    const flyerCta = document.getElementById('flyer_cta');
    const flyerCtaTop = document.getElementById('flyer_cta_top');
    const flyerCtaBottom = document.getElementById('flyer_cta_bottom');
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
        flyerTitle.textContent = (text || 'Mi Negocio').toUpperCase();
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
        if (selectBadge && selectBadge.value === 'none') {
            flyerBadgeDisplay.style.display = 'none';
            return;
        }
        flyerBadgeDisplay.style.display = 'block';
        if (selectBadge && selectBadge.value === 'custom') {
            flyerBadgeDisplay.textContent = (inputBadgeCustom.value.trim().toUpperCase()) || '★ DESTACADO ★';
        } else if (selectBadge) {
            flyerBadgeDisplay.textContent = selectBadge.value;
        }
    }

    function getCtaParts() {
        const val = selectCta ? selectCta.value : 'fidelizar';
        const presets = {
            fidelizar: {
                topLines: ['¡COMPRA,', 'ACUMULA PUNTOS'],
                bottomLines: ['Y GANA', 'PREMIOS!']
            },
            escanear: {
                topLines: ['¡ESCANEA AQUÍ', 'Y OBTÉN'],
                bottomLines: ['RECOMPENSAS', 'EXCLUSIVAS!']
            },
            puntos: {
                topLines: ['¡HAZTE CLIENTE', 'FRECUENTE'],
                bottomLines: ['Y GANA', 'REGALOS!']
            },
            premios: {
                topLines: ['¡PUNTOS,', 'SORTEOS Y'],
                bottomLines: ['DESCUENTOS', 'DIRECTOS!']
            },
            comunidad: {
                topLines: ['¡ÚNETE A', 'NUESTRO CLUB'],
                bottomLines: ['DE CLIENTES', 'LEALES!']
            }
        };

        if (val !== 'custom' && presets[val]) {
            return presets[val];
        }

        const raw = (inputCtaCustom.value.trim() || '¡Compra, acumula puntos y gana premios!').toUpperCase();
        const words = raw.split(/\s+/).filter(Boolean);
        if (words.length <= 2) {
            return {
                topLines: [words[0] || '¡COMPRA'],
                bottomLines: [words.slice(1).join(' ') || 'Y GANA!']
            };
        }

        const mid = Math.ceil(words.length / 2);
        const topWords = words.slice(0, mid);
        const bottomWords = words.slice(mid);

        const splitTwoLines = (arr) => {
            if (arr.length <= 2) return [arr.join(' ')];
            const half = Math.ceil(arr.length / 2);
            return [arr.slice(0, half).join(' '), arr.slice(half).join(' ')];
        };

        return {
            topLines: splitTwoLines(topWords),
            bottomLines: splitTwoLines(bottomWords)
        };
    }

    function updateFlyerCta() {
        const parts = getCtaParts();
        if (flyerCtaTop && flyerCtaBottom) {
            flyerCtaTop.innerHTML = '';
            parts.topLines.forEach((line, idx) => {
                if (idx > 0) flyerCtaTop.appendChild(document.createElement('br'));
                flyerCtaTop.appendChild(document.createTextNode(line));
            });

            flyerCtaBottom.innerHTML = '';
            parts.bottomLines.forEach((line, idx) => {
                if (idx > 0) flyerCtaBottom.appendChild(document.createElement('br'));
                flyerCtaBottom.appendChild(document.createTextNode(line));
            });
        } else if (flyerCta) {
            flyerCta.textContent = [...parts.topLines, ...parts.bottomLines].join(' ');
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
        if (flyerPhotoAmbient) {
            flyerPhotoAmbient.style.backgroundImage = `url("${url}")`;
        }
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
        if (flyerPhotoAmbient) {
            flyerPhotoAmbient.style.backgroundImage = '';
        }
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
                waveTop: '#ffe600',
                waveBottom: '#c4227d',
                cornerWave: '#ffe600',
                archBg: '#d81b7a',
                border: '#1e1e2c',
                topPillBgStart: '#9d145f',
                topPillBgEnd: '#d81b7a',
                topPillBorder: '#1e1e2c',
                topPillText: '#ffffff',
                topPillStarBg: '#ffe600',
                topPillStarText: '#1e1e2c',
                title: '#1e1e2c',
                userBadgeBg: '#ffffff',
                userBadgeText: '#1e1e2c',
                userBadgeBorder: '#1e1e2c',
                ctaTopText: '#1e1e2c',
                ctaRibbonBg: '#d81b7a',
                ctaRibbonText: '#ffffff',
                benefitsBg: '#ffffff',
                benefitsText: '#1e1e2c',
                benefitsDivider: '#d81b7a',
                qrFrameBg: '#b8166b',
                qrFrameBorder: '#ffffff',
                qrLabelBg: '#ffe600',
                qrLabelText: '#1e1e2c',
                connectBg: '#230922',
                connectText: '#ffffff',
                stepNumBg: '#ffe600',
                stepNumText: '#1e1e2c',
                stepText: '#ffffff',
                stepDivider: 'rgba(255, 255, 255, 0.72)',
                footerPillBg: '#ffffff',
                footerPillText: '#1e1e2c'
            },
            dark: {
                waveTop: '#141622',
                waveBottom: '#0b0c12',
                cornerWave: '#ffe600',
                archBg: '#c4227d',
                border: '#ffffff',
                topPillBgStart: '#ffe600',
                topPillBgEnd: '#f59e0b',
                topPillBorder: '#ffffff',
                topPillText: '#12131a',
                topPillStarBg: '#c4227d',
                topPillStarText: '#ffffff',
                title: '#ffffff',
                userBadgeBg: '#1f2233',
                userBadgeText: '#ffe600',
                userBadgeBorder: '#ffe600',
                ctaTopText: '#ffffff',
                ctaRibbonBg: '#c4227d',
                ctaRibbonText: '#ffffff',
                benefitsBg: '#1e2030',
                benefitsText: '#ffffff',
                benefitsDivider: '#ffe600',
                qrFrameBg: '#1e2030',
                qrFrameBorder: '#ffe600',
                qrLabelBg: '#ffe600',
                qrLabelText: '#12131a',
                connectBg: '#c4227d',
                connectText: '#ffffff',
                stepNumBg: '#ffe600',
                stepNumText: '#12131a',
                stepText: '#f8fafc',
                stepDivider: 'rgba(255, 230, 0, 0.35)',
                footerPillBg: '#ffffff',
                footerPillText: '#12131a'
            },
            yellow: {
                waveTop: '#ffffff',
                waveBottom: '#ffe600',
                cornerWave: '#c4227d',
                archBg: '#c4227d',
                border: '#1e1e2c',
                topPillBgStart: '#1e1e2c',
                topPillBgEnd: '#1e1e2c',
                topPillBorder: '#1e1e2c',
                topPillText: '#ffffff',
                topPillStarBg: '#c4227d',
                topPillStarText: '#ffffff',
                title: '#1e1e2c',
                userBadgeBg: '#ffe600',
                userBadgeText: '#1e1e2c',
                userBadgeBorder: '#1e1e2c',
                ctaTopText: '#1e1e2c',
                ctaRibbonBg: '#c4227d',
                ctaRibbonText: '#ffffff',
                benefitsBg: '#1e1e2c',
                benefitsText: '#ffffff',
                benefitsDivider: '#ffe600',
                qrFrameBg: '#c4227d',
                qrFrameBorder: '#1e1e2c',
                qrLabelBg: '#1e1e2c',
                qrLabelText: '#ffffff',
                connectBg: '#c4227d',
                connectText: '#ffffff',
                stepNumBg: '#c4227d',
                stepNumText: '#ffffff',
                stepText: '#1e1e2c',
                stepDivider: 'rgba(30, 30, 44, 0.25)',
                footerPillBg: '#ffffff',
                footerPillText: '#1e1e2c'
            },
            minimalist: {
                waveTop: '#f8fafc',
                waveBottom: '#0f172a',
                cornerWave: '#cbd5e1',
                archBg: '#334155',
                border: '#0f172a',
                topPillBgStart: '#0f172a',
                topPillBgEnd: '#1e293b',
                topPillBorder: '#0f172a',
                topPillText: '#ffffff',
                topPillStarBg: '#e2e8f0',
                topPillStarText: '#0f172a',
                title: '#0f172a',
                userBadgeBg: '#ffffff',
                userBadgeText: '#0f172a',
                userBadgeBorder: '#0f172a',
                ctaTopText: '#0f172a',
                ctaRibbonBg: '#0f172a',
                ctaRibbonText: '#ffffff',
                benefitsBg: '#ffffff',
                benefitsText: '#0f172a',
                benefitsDivider: '#cbd5e1',
                qrFrameBg: '#1e293b',
                qrFrameBorder: '#ffffff',
                qrLabelBg: '#e2e8f0',
                qrLabelText: '#0f172a',
                connectBg: '#334155',
                connectText: '#ffffff',
                stepNumBg: '#e2e8f0',
                stepNumText: '#0f172a',
                stepText: '#f8fafc',
                stepDivider: 'rgba(255, 255, 255, 0.25)',
                footerPillBg: '#ffffff',
                footerPillText: '#0f172a'
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

    // ---- Renderizado en el Canvas HD (1080x1390) ----
    function renderCanvas(canvas, ctx, theme, bizImage, qrImage, logoImage, iconImage, playStoreImage, appStoreImage) {
        const width = canvas.width;
        const height = canvas.height;
        const borderThickness = 8;

        // 0. Base general
        ctx.fillStyle = theme.waveTop;
        ctx.fillRect(0, 0, width, height);

        // 1. ZONA DE FOTO SUPERIOR DERECHA (Ambiente + Arco Magenta + Foto + Rayos + Sticker)
        const photoZoneX = 450;
        const photoZoneY = 0;
        const photoZoneW = width - photoZoneX;
        const photoZoneH = 780;

        ctx.save();
        ctx.beginPath();
        ctx.rect(photoZoneX, photoZoneY, photoZoneW, photoZoneH);
        ctx.clip();

        if (bizImage) {
            ctx.save();
            ctx.filter = 'blur(16px) saturate(1.15)';
            ctx.drawImage(bizImage, photoZoneX - 40, photoZoneY - 40, photoZoneW + 80, photoZoneH + 80);
            ctx.restore();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
            ctx.fillRect(photoZoneX, photoZoneY, photoZoneW, photoZoneH);
        } else {
            const ambGrad = ctx.createLinearGradient(photoZoneX, 0, width, photoZoneH);
            ambGrad.addColorStop(0, '#cbd5e1');
            ambGrad.addColorStop(0.5, '#94a3b8');
            ambGrad.addColorStop(1, '#475569');
            ctx.fillStyle = ambGrad;
            ctx.fillRect(photoZoneX, photoZoneY, photoZoneW, photoZoneH);
        }

        // Arco Magenta Inclinado detrás de la foto
        ctx.save();
        ctx.translate(770, 460);
        ctx.rotate(-7 * Math.PI / 180);
        ctx.fillStyle = theme.archBg;
        drawArchRect(ctx, -265, -295, 530, 590, 210, 55);
        ctx.fill();
        ctx.restore();

        // Contenedor principal de la foto
        const pBoxX = 522;
        const pBoxY = 108;
        const pBoxW = 520;
        const pBoxH = 640;

        ctx.save();
        drawArchRect(ctx, pBoxX, pBoxY, pBoxW, pBoxH, 185, 48);
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.clip();

        if (bizImage) {
            const imgW = bizImage.width;
            const imgH = bizImage.height;
            const targetRatio = pBoxW / pBoxH;
            const imgRatio = imgW / imgH;

            let drawW, drawH, drawX, drawY;
            const offsetX = parseInt(inputPhotoOffsetX.value, 10);
            const offsetY = parseInt(inputPhotoOffsetY.value, 10);

            if (imgRatio > targetRatio) {
                drawH = pBoxH;
                drawW = pBoxH * imgRatio;
                drawX = pBoxX + (pBoxW - drawW) * (offsetX / 100);
                drawY = pBoxY;
            } else {
                drawW = pBoxW;
                drawH = pBoxW / imgRatio;
                drawX = pBoxX;
                drawY = pBoxY + (pBoxH - drawH) * (offsetY / 100);
            }
            ctx.drawImage(bizImage, drawX, drawY, drawW, drawH);
        } else {
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(pBoxX, pBoxY, pBoxW, pBoxH);
            ctx.fillStyle = '#1e1e2c';
            ctx.font = '850 30px "Outfit", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Tu Foto Aquí', pBoxX + pBoxW / 2 + 15, pBoxY + pBoxH / 2 - 10);
            ctx.fillStyle = '#475569';
            ctx.font = '700 20px "Nunito", Arial, sans-serif';
            ctx.fillText('Sube la foto de tu negocio', pBoxX + pBoxW / 2 + 15, pBoxY + pBoxH / 2 + 28);
        }
        ctx.restore();

        // Borde del contenedor de foto
        ctx.strokeStyle = theme.archBg;
        ctx.lineWidth = 6;
        drawArchRect(ctx, pBoxX, pBoxY, pBoxW, pBoxH, 185, 48);
        ctx.stroke();

        // Rayos amarillos sobre la esquina superior derecha de la foto
        ctx.save();
        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        drawLine(ctx, 962, 114, 984, 88);
        drawLine(ctx, 976, 134, 1020, 108);
        drawLine(ctx, 982, 152, 1026, 144);
        ctx.restore();

        // Sticker Comercial Flotante en la foto (si está activo)
        if (!selectBadge || selectBadge.value !== 'none') {
            let badgeText = '🎁 ¡GANA PREMIOS!';
            if (selectBadge && selectBadge.value === 'custom') {
                badgeText = inputBadgeCustom.value.trim().toUpperCase() || '★ DESTACADO ★';
            } else if (selectBadge) {
                badgeText = selectBadge.value.toUpperCase();
            }

            ctx.font = '900 24px "Outfit", Arial, sans-serif';
            const badgeW = ctx.measureText(badgeText).width + 48;
            const badgeH = 48;
            const badgeX = width - badgeW - 38;
            const badgeY = 640;

            ctx.save();
            ctx.translate(badgeX + badgeW / 2, badgeY + badgeH / 2);
            ctx.rotate(-2 * Math.PI / 180);

            ctx.fillStyle = '#1e1e2c';
            drawRoundedRect(ctx, -badgeW / 2 + 5, -badgeH / 2 + 5, badgeW, badgeH, badgeH / 2);
            ctx.fill();

            ctx.fillStyle = theme.topPillStarBg;
            drawRoundedRect(ctx, -badgeW / 2, -badgeH / 2, badgeW, badgeH, badgeH / 2);
            ctx.fill();
            ctx.strokeStyle = '#1e1e2c';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = theme.topPillStarText;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(badgeText, 0, 1);
            ctx.restore();
        }

        ctx.restore(); // Fin clip zona foto

        // 2. CURVA DIAGONAL AMARILLA SUPERIOR IZQUIERDA
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = theme.waveTop;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(670, 0);
        ctx.bezierCurveTo(570, 190, 565, 450, 535, 660);
        ctx.bezierCurveTo(510, 775, 260, 820, 0, 835);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 3. BLOQUE CURVO MAGENTA INFERIOR + ONDAS DE ESQUINA
        const bottomWaveTopY = 695;
        ctx.save();
        ctx.fillStyle = theme.waveBottom;
        ctx.beginPath();
        ctx.moveTo(0, bottomWaveTopY + 95);
        ctx.bezierCurveTo(260, bottomWaveTopY + 20, 820, bottomWaveTopY + 20, width, bottomWaveTopY + 95);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Onda esquina inferior izquierda
        ctx.fillStyle = theme.cornerWave;
        ctx.beginPath();
        ctx.moveTo(0, 1235);
        ctx.bezierCurveTo(95, 1255, 180, 1315, 235, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Onda esquina inferior derecha
        ctx.beginPath();
        ctx.moveTo(width, 1220);
        ctx.bezierCurveTo(960, 1255, 860, 1315, 790, height);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 4. BARRA SUPERIOR CO-BRANDING (Píldora + Rayos)
        const pillY = 34;
        const pillHeight = 56;
        const pillText = 'PROGRAMA DE FIDELIZACIÓN';

        ctx.font = '850 24px "Outfit", Arial, sans-serif';
        const tagTextWidth = ctx.measureText(pillText).width;
        const iconBoxSize = 44;
        const starWidth = 104;
        const pillPaddingH = 20;
        const pillContentGap = 18;
        const pillWidth = iconBoxSize + tagTextWidth + starWidth + (pillContentGap * 2) + (pillPaddingH * 2);
        const pillX = (width - pillWidth) / 2 + 18;

        // Rayos decorativos a la izquierda de la píldora superior
        ctx.save();
        ctx.strokeStyle = theme.archBg;
        ctx.lineWidth = 7.5;
        ctx.lineCap = 'round';
        drawLine(ctx, pillX - 18, pillY + 14, pillX - 42, pillY - 2);
        drawLine(ctx, pillX - 24, pillY + 30, pillX - 62, pillY + 18);
        drawLine(ctx, pillX - 20, pillY + 46, pillX - 52, pillY + 48);
        ctx.restore();

        // Fondo con gradiente de la píldora superior
        const pillGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillWidth, pillY);
        pillGrad.addColorStop(0, theme.topPillBgStart);
        pillGrad.addColorStop(1, theme.topPillBgEnd);
        ctx.fillStyle = pillGrad;
        drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
        ctx.fill();
        ctx.strokeStyle = theme.topPillBorder;
        ctx.lineWidth = 4.5;
        ctx.stroke();

        // Caja amarilla del ícono en la píldora
        const iconBoxX = pillX + pillPaddingH;
        const iconBoxY = pillY + (pillHeight - iconBoxSize) / 2;
        ctx.fillStyle = '#ffe600';
        drawRoundedRect(ctx, iconBoxX, iconBoxY, iconBoxSize, iconBoxSize, 10);
        ctx.fill();

        if (iconImage && iconImage.complete && iconImage.naturalWidth > 0) {
            ctx.drawImage(iconImage, iconBoxX + 5, iconBoxY + 5, iconBoxSize - 10, iconBoxSize - 10);
        }

        // Texto central de la píldora
        ctx.fillStyle = theme.topPillText;
        ctx.font = '850 24px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const textDrawX = iconBoxX + iconBoxSize + pillContentGap;
        ctx.fillText(pillText, textDrawX, pillY + pillHeight / 2 + 1);

        // Píldora ★ VIP ★
        const starX = textDrawX + tagTextWidth + pillContentGap;
        const starHeight = 36;
        const starY = pillY + (pillHeight - starHeight) / 2;
        ctx.fillStyle = theme.topPillStarBg;
        drawRoundedRect(ctx, starX, starY, starWidth, starHeight, starHeight / 2);
        ctx.fill();
        ctx.strokeStyle = '#1e1e2c';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.fillStyle = theme.topPillStarText;
        ctx.font = '900 20px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ VIP ★', starX + starWidth / 2, starY + starHeight / 2 + 1);

        // 5. IDENTIDAD DEL NEGOCIO (COLUMNA IZQUIERDA: Ícono Tienda + Nombre + @usuario)
        const leftColCenterX = 295;
        const headerTopY = 148;

        const bizNameText = (inputBusinessName.value.trim() || 'MI NEGOCIO').toUpperCase();
        ctx.font = '900 54px "Outfit", Arial, sans-serif';
        const maxTitleW = 395;
        const titleLines = wrapText(ctx, bizNameText, maxTitleW).slice(0, 2);
        if (titleLines.length > 1) {
            ctx.font = '900 44px "Outfit", Arial, sans-serif';
        }
        const widestTitleLine = Math.max(...titleLines.map((l) => ctx.measureText(l).width));
        const storeIconW = 92;
        const brandGap = 16;
        const totalBrandW = storeIconW + brandGap + widestTitleLine;
        const brandStartX = Math.max(44, leftColCenterX - totalBrandW / 2);

        // Dibujar Ícono Vectorial de Tienda
        drawStoreIcon(ctx, brandStartX, headerTopY, storeIconW, 86);

        // Dibujar Nombre del Negocio
        ctx.fillStyle = theme.title;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const titleDrawX = brandStartX + storeIconW + brandGap;
        if (titleLines.length === 1) {
            ctx.fillText(titleLines[0], titleDrawX, headerTopY + 45);
        } else {
            ctx.fillText(titleLines[0], titleDrawX, headerTopY + 24);
            ctx.fillText(titleLines[1], titleDrawX, headerTopY + 68);
        }

        // Píldora @usuario + Checkmark + Línea Magenta
        const bizUserVal = inputBusinessUser.value.trim();
        const bizUserText = bizUserVal ? `@${bizUserVal.toLowerCase()}` : '@minegocio';

        ctx.font = '850 31px "Outfit", Arial, sans-serif';
        const userTextWidth = ctx.measureText(bizUserText).width;
        const userPillW = userTextWidth + 92;
        const userPillH = 54;
        const userPillX = leftColCenterX - userPillW / 2;
        const userPillY = headerTopY + 104;

        ctx.fillStyle = theme.userBadgeBg;
        drawRoundedRect(ctx, userPillX, userPillY, userPillW, userPillH, userPillH / 2);
        ctx.fill();
        ctx.strokeStyle = theme.userBadgeBorder;
        ctx.lineWidth = 4.5;
        ctx.stroke();

        ctx.fillStyle = theme.userBadgeText;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(bizUserText, userPillX + 24, userPillY + userPillH / 2 + 1);

        const checkRadius = 16;
        const checkCenterX = userPillX + 24 + userTextWidth + 26;
        const checkCenterY = userPillY + userPillH / 2;

        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.arc(checkCenterX, checkCenterY, checkRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e1e2c';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 19px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓', checkCenterX, checkCenterY + 1);

        // Línea de acento magenta bajo el usuario
        ctx.fillStyle = theme.archBg;
        drawRoundedRect(ctx, leftColCenterX - 68, userPillY + userPillH + 14, 136, 7, 3.5);
        ctx.fill();

        // 6. TITULAR PRINCIPAL INCLINADO + CINTA MAGENTA + CAJA DE REGALO
        const ctaParts = getCtaParts();
        ctx.save();
        ctx.translate(leftColCenterX, 500);
        ctx.rotate(-4 * Math.PI / 180);

        // Texto superior (negro/blanco inclinado)
        ctx.fillStyle = theme.ctaTopText;
        ctx.font = 'italic 900 47px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let topTextY = ctaParts.topLines.length > 1 ? -110 : -85;
        ctaParts.topLines.forEach((line) => {
            ctx.fillText(line, 0, topTextY);
            topTextY += 48;
        });

        // Cinta Magenta Inferior
        ctx.font = 'italic 900 52px "Outfit", Arial, sans-serif';
        const maxBottomW = Math.max(...ctaParts.bottomLines.map((l) => ctx.measureText(l).width));
        const ribbonW = Math.min(460, Math.max(300, maxBottomW + 76));
        const ribbonH = ctaParts.bottomLines.length > 1 ? 124 : 74;
        const ribbonX = -ribbonW / 2;
        const ribbonY = -18;

        // Rayos a la izquierda de la cinta
        ctx.save();
        ctx.strokeStyle = theme.ctaRibbonBg;
        ctx.lineWidth = 7.5;
        ctx.lineCap = 'round';
        drawLine(ctx, ribbonX - 16, ribbonY + 26, ribbonX - 44, ribbonY + 10);
        drawLine(ctx, ribbonX - 20, ribbonY + ribbonH / 2, ribbonX - 52, ribbonY + ribbonH / 2);
        drawLine(ctx, ribbonX - 16, ribbonY + ribbonH - 26, ribbonX - 44, ribbonY + ribbonH - 10);
        ctx.restore();

        // Sombra y fondo de la cinta
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        drawRoundedRect(ctx, ribbonX + 6, ribbonY + 7, ribbonW, ribbonH, 20);
        ctx.fill();

        ctx.fillStyle = theme.ctaRibbonBg;
        drawRoundedRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 20);
        ctx.fill();

        // Texto dentro de la cinta magenta
        ctx.fillStyle = theme.ctaRibbonText;
        if (ctaParts.bottomLines.length === 1) {
            ctx.fillText(ctaParts.bottomLines[0], 0, ribbonY + ribbonH / 2 + 2);
        } else {
            ctx.fillText(ctaParts.bottomLines[0], 0, ribbonY + 36);
            ctx.fillText(ctaParts.bottomLines[1], 0, ribbonY + 88);
        }

        // Caja de regalo ilustrada en la esquina inferior derecha de la cinta
        drawGiftBoxIcon(ctx, ribbonX + ribbonW - 28, ribbonY + ribbonH - 42, 96);
        ctx.restore();

        // 7. BARRA BLANCA CENTRAL DE BENEFICIOS (2 MENSAJES)
        const benX = 46;
        const benY = 716;
        const benW = width - benX * 2;
        const benH = 122;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 22;
        ctx.shadowOffsetY = 8;
        ctx.fillStyle = theme.benefitsBg;
        drawRoundedRect(ctx, benX, benY, benW, benH, benH / 2);
        ctx.fill();
        ctx.restore();

        // Beneficio 1: Canjea premios
        const col1CenterX = benX + benW * 0.26;
        drawGiftBoxIcon(ctx, col1CenterX - 135, benY + 20, 82);
        ctx.fillStyle = theme.benefitsText;
        ctx.font = '850 33px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('Canjea', col1CenterX - 38, benY + 44);
        ctx.fillText('premios', col1CenterX - 38, benY + 80);

        // Divisor central magenta
        ctx.fillStyle = theme.benefitsDivider;
        drawRoundedRect(ctx, width / 2 - 2.5, benY + 26, 5, benH - 52, 2.5);
        ctx.fill();

        // Beneficio 2: Encuentra más beneficios
        const col2CenterX = benX + benW * 0.73;
        drawDiscountTagIcon(ctx, col2CenterX - 175, benY + 20, 82);
        ctx.fillStyle = theme.benefitsText;
        ctx.font = '850 33px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Encuentra más', col2CenterX - 78, benY + 44);
        ctx.fillText('beneficios', col2CenterX - 78, benY + 80);

        // 8. SECCIÓN INFERIOR DE CONVERSIÓN (QR + FLECHA + PASOS + TIENDAS)
        const qrOuterX = 64;
        const qrOuterY = 892;
        const qrOuterSize = 310;

        // Marco exterior del QR
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.24)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 8;
        ctx.fillStyle = theme.qrFrameBg;
        drawRoundedRect(ctx, qrOuterX, qrOuterY, qrOuterSize, qrOuterSize, 36);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = theme.qrFrameBorder;
        ctx.lineWidth = 5;
        drawRoundedRect(ctx, qrOuterX, qrOuterY, qrOuterSize, qrOuterSize, 36);
        ctx.stroke();

        // Contenedor blanco del QR
        const qrInnerPad = 32;
        const qrBoxX = qrOuterX + qrInnerPad;
        const qrBoxY = qrOuterY + qrInnerPad;
        const qrSize = qrOuterSize - qrInnerPad * 2;

        ctx.fillStyle = '#ffffff';
        drawRoundedRect(ctx, qrBoxX, qrBoxY, qrSize, qrSize, 20);
        ctx.fill();

        // Esquinas blancas de escaneo [ ]
        const cornerLen = 28;
        const cornerOffset = 12;
        const cLeft = qrBoxX - cornerOffset;
        const cRight = qrBoxX + qrSize + cornerOffset;
        const cTop = qrBoxY - cornerOffset;
        const cBottom = qrBoxY + qrSize + cornerOffset;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6.5;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(cLeft, cTop + cornerLen);
        ctx.lineTo(cLeft, cTop);
        ctx.lineTo(cLeft + cornerLen, cTop);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cRight - cornerLen, cTop);
        ctx.lineTo(cRight, cTop);
        ctx.lineTo(cRight, cTop + cornerLen);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cLeft, cBottom - cornerLen);
        ctx.lineTo(cLeft, cBottom);
        ctx.lineTo(cLeft + cornerLen, cBottom);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cRight - cornerLen, cBottom);
        ctx.lineTo(cRight, cBottom);
        ctx.lineTo(cRight, cBottom - cornerLen);
        ctx.stroke();

        // Imagen del QR
        if (qrImage && qrImage.src) {
            ctx.drawImage(qrImage, qrBoxX + 12, qrBoxY + 12, qrSize - 24, qrSize - 24);
        } else {
            ctx.fillStyle = '#9ca3af';
            ctx.font = 'bold 20px "Nunito", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('CÓDIGO QR', qrBoxX + qrSize / 2, qrBoxY + qrSize / 2);
        }

        // Botón Píldora Amarillo: ESCANEA AQUÍ
        const labelW = 286;
        const labelH = 50;
        const labelX = qrOuterX + (qrOuterSize - labelW) / 2;
        const labelY = qrOuterY + qrOuterSize + 18;

        ctx.fillStyle = theme.qrLabelBg;
        drawRoundedRect(ctx, labelX, labelY, labelW, labelH, labelH / 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = theme.qrLabelText;
        ctx.font = '900 23px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📷 ESCANEA AQUÍ', labelX + labelW / 2, labelY + labelH / 2 + 1);

        // Flecha Curva Amarilla apuntando al QR
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(465, 902);
        ctx.quadraticCurveTo(405, 898, 382, 956);
        ctx.stroke();

        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(462, 898);
        ctx.quadraticCurveTo(402, 895, 380, 954);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(370, 932);
        ctx.lineTo(378, 959);
        ctx.lineTo(404, 948);
        ctx.stroke();
        ctx.restore();

        // Badge inclinado: ¡Conéctate con mi negocio! + Rayos amarillos
        const stepsX = 435;
        ctx.save();
        ctx.translate(680, 908);
        ctx.rotate(-3 * Math.PI / 180);

        ctx.fillStyle = theme.connectBg;
        drawRoundedRect(ctx, -185, -38, 220, 46, 16);
        ctx.fill();
        drawRoundedRect(ctx, -145, 2, 315, 48, 16);
        ctx.fill();

        ctx.fillStyle = theme.connectText;
        ctx.font = 'italic 850 32px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('¡Conéctate', -75, -14);
        ctx.fillText('con mi negocio!', 12, 26);
        ctx.restore();

        // Rayos amarillos a la derecha de ¡Conéctate con mi negocio!
        ctx.save();
        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        drawLine(ctx, 875, 875, 892, 854);
        drawLine(ctx, 886, 890, 918, 874);
        drawLine(ctx, 890, 905, 922, 900);
        ctx.restore();

        // 3 Pasos Numerados con Líneas Divisorias Blancas
        const steps = [
            { num: '1', text: 'Escanea el QR o descarga NEDLEAL' },
            { num: '2', text: 'Acumula puntos en cada compra o visita' },
            { num: '3', text: '¡Canjea increíbles regalos y descuentos!' }
        ];

        let stepY = 978;
        const stepNumRadius = 23;
        const stepsEndX = 1020;

        steps.forEach((step, idx) => {
            // Círculo amarillo
            ctx.fillStyle = theme.stepNumBg;
            ctx.beginPath();
            ctx.arc(stepsX + stepNumRadius, stepY + stepNumRadius, stepNumRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = theme.stepNumText;
            ctx.font = '900 25px "Outfit", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(step.num, stepsX + stepNumRadius, stepY + stepNumRadius + 1);

            // Texto del paso
            ctx.fillStyle = theme.stepText;
            ctx.font = '750 24px "Nunito", Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(step.text, stepsX + stepNumRadius * 2 + 16, stepY + stepNumRadius + 1);

            // Línea divisoria blanca entre pasos
            if (idx < steps.length - 1) {
                ctx.strokeStyle = theme.stepDivider;
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                ctx.moveTo(stepsX + stepNumRadius * 2 + 16, stepY + 56);
                ctx.lineTo(stepsEndX, stepY + 56);
                ctx.stroke();
            }

            stepY += 68;
        });

        // Píldora Blanca Inferior: Logo NED + Gratis en: Play Store / App Store
        const footerPillW = 420;
        const footerPillH = 62;
        const footerPillX = stepsX + (stepsEndX - stepsX - footerPillW) / 2;
        const footerPillY = 1202;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 5;
        ctx.fillStyle = theme.footerPillBg;
        drawRoundedRect(ctx, footerPillX, footerPillY, footerPillW, footerPillH, footerPillH / 2);
        ctx.fill();
        ctx.restore();

        let cursorX = footerPillX + 34;
        if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
            const logoH = 42;
            const logoW = (logoImage.width / logoImage.height) * logoH;
            ctx.drawImage(logoImage, cursorX, footerPillY + (footerPillH - logoH) / 2, logoW, logoH);
            cursorX += logoW + 20;
        }

        ctx.fillStyle = theme.footerPillText;
        ctx.font = '850 22px "Outfit", Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('Gratis en:', cursorX, footerPillY + footerPillH / 2 + 1);
        cursorX += ctx.measureText('Gratis en:').width + 18;

        const storeIconSize = 36;
        if (playStoreImage && playStoreImage.complete && playStoreImage.naturalWidth > 0) {
            ctx.drawImage(playStoreImage, cursorX, footerPillY + (footerPillH - storeIconSize) / 2, storeIconSize, storeIconSize);
            cursorX += storeIconSize + 14;
        }
        if (appStoreImage && appStoreImage.complete && appStoreImage.naturalWidth > 0) {
            ctx.drawImage(appStoreImage, cursorX, footerPillY + (footerPillH - storeIconSize) / 2, storeIconSize, storeIconSize);
        }

        // 9. Borde General Exterior del Cartel
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = borderThickness * 2;
        ctx.strokeRect(0, 0, width, height);
    }

    // ---- Funciones Auxiliares de Dibujo Vectorial en Canvas ----
    function drawLine(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    function drawArchRect(ctx, x, y, w, h, rTop, rBottom) {
        const rt = Math.min(rTop, w / 2, h / 2);
        const rb = Math.min(rBottom, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + rt, y);
        ctx.lineTo(x + w - rt, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + rt);
        ctx.lineTo(x + w, y + h - rb);
        ctx.quadraticCurveTo(x + w, y + h, x + w - rb, y + h);
        ctx.lineTo(x + rb, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - rb);
        ctx.lineTo(x, y + rt);
        ctx.quadraticCurveTo(x, y, x + rt, y);
        ctx.closePath();
    }

    function drawStoreIcon(ctx, x, y, w, h) {
        ctx.save();
        ctx.translate(x, y);
        const sx = w / 84;
        const sy = h / 80;
        ctx.scale(sx, sy);

        // Cuerpo blanco
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1e1e2c';
        ctx.lineWidth = 5.5;
        drawRoundedRect(ctx, 12, 34, 60, 40, 6);
        ctx.fill();
        ctx.stroke();

        // Puerta
        ctx.fillStyle = '#1e1e2c';
        drawArchRect(ctx, 33, 47, 18, 27, 8, 0);
        ctx.fill();

        // Toldo
        ctx.fillStyle = '#ff3e9d';
        ctx.strokeStyle = '#1e1e2c';
        ctx.lineWidth = 5.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(6, 32);
        ctx.lineTo(15, 10);
        ctx.quadraticCurveTo(17, 6, 24, 6);
        ctx.lineTo(60, 6);
        ctx.quadraticCurveTo(67, 6, 69, 10);
        ctx.lineTo(78, 32);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ondas inferiores del toldo
        ctx.beginPath();
        ctx.moveTo(6, 32);
        ctx.bezierCurveTo(6, 41, 24, 41, 24, 32);
        ctx.bezierCurveTo(24, 41, 42, 41, 42, 32);
        ctx.bezierCurveTo(42, 41, 60, 41, 60, 32);
        ctx.bezierCurveTo(60, 41, 78, 41, 78, 32);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    function drawGiftBoxIcon(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x + size / 2, y + size / 2);
        ctx.rotate(5 * Math.PI / 180);
        const s = size / 96;
        ctx.scale(s, s);
        ctx.translate(-48, -48);

        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1e1e2c';
        ctx.lineWidth = 5;

        // Moño superior
        ctx.fillStyle = '#ff2e93';
        ctx.beginPath();
        ctx.moveTo(48, 28);
        ctx.bezierCurveTo(36, 10, 18, 16, 24, 30);
        ctx.bezierCurveTo(28, 36, 42, 32, 48, 28);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(48, 28);
        ctx.bezierCurveTo(60, 10, 78, 16, 72, 30);
        ctx.bezierCurveTo(68, 36, 54, 32, 48, 28);
        ctx.fill();
        ctx.stroke();

        // Caja
        ctx.fillStyle = '#ffe600';
        drawRoundedRect(ctx, 18, 42, 60, 42, 6);
        ctx.fill();
        ctx.stroke();

        // Cinta vertical
        ctx.fillStyle = '#d81b7a';
        ctx.fillRect(41, 42, 14, 42);
        ctx.strokeRect(41, 42, 14, 42);

        // Tapa
        ctx.fillStyle = '#ffe600';
        drawRoundedRect(ctx, 13, 28, 70, 16, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ff2e93';
        ctx.fillRect(41, 28, 14, 16);
        ctx.strokeRect(41, 28, 14, 16);

        ctx.restore();
    }

    function drawDiscountTagIcon(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x + size / 2, y + size / 2);
        ctx.rotate(-32 * Math.PI / 180);
        const s = size / 76;
        ctx.scale(s, s);
        ctx.translate(-38, -38);

        ctx.fillStyle = '#ffe600';
        ctx.strokeStyle = '#1e1e2c';
        ctx.lineWidth = 4.5;
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(14, 22);
        ctx.lineTo(48, 22);
        ctx.lineTo(64, 38);
        ctx.lineTo(48, 54);
        ctx.lineTo(14, 54);
        ctx.quadraticCurveTo(9, 54, 9, 49);
        ctx.lineTo(9, 27);
        ctx.quadraticCurveTo(9, 22, 14, 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Agujero de etiqueta
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(51, 38, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Símbolo %
        ctx.lineCap = 'round';
        drawLine(ctx, 22, 45, 38, 31);
        ctx.fillStyle = '#1e1e2c';
        ctx.beginPath();
        ctx.arc(24, 33, 3.2, 0, Math.PI * 2);
        ctx.arc(36, 43, 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
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
