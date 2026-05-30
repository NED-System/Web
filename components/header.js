// Header component
const headerTemplate = document.createElement('template');

// Función para determinar la ruta base correcta
function getBasePath() {
    const currentPath = window.location.pathname;
    const normalizedPath = currentPath.endsWith('/') ? currentPath : currentPath + '/';

    if (normalizedPath === '/' || normalizedPath.endsWith('/index.html')) {
        return './';
    }

    if (normalizedPath.includes('/pages/')) {
        return normalizedPath.replace(/\/pages\/.*$/, '/');
    }

    return './';
}

// Crear el header con la ruta base correcta
function createHeader() {
    const basePath = getBasePath();
    
    headerTemplate.innerHTML = `
        <header class="header">
            <nav class="nav" aria-label="Navegación principal">
                <div class="logo">
                    <a href="${basePath}index.html" aria-label="Inicio">
                        <img src="${basePath}assets/logo/LogoNED.png" alt="NED logo" width="90" height="90" loading="eager">
                    </a>
                </div>
                <button class="hamburger" aria-label="Menú" aria-expanded="false" aria-controls="nav-menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <ul class="nav_links" id="nav-menu" role="menu">
                    <li role="none"><a href="${basePath}index.html" role="menuitem">Inicio</a></li>
                    <li role="none"><a href="${basePath}pages/consumidores.html" role="menuitem">Consumidores</a></li>
                    <li role="none"><a href="${basePath}pages/negocios.html" role="menuitem">Negocios</a></li>
                    <li role="none"><a href="${basePath}pages/planes.html" role="menuitem">Planes</a></li>
                </ul>
            </nav>
        </header>
    `;
}

// Crear el header cuando se carga el script
createHeader();

function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.appendChild(headerTemplate.content.cloneNode(true));

        // Inicializar funcionalidad de menú móvil (hamburguesa)
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav_links');

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
                hamburger.setAttribute('aria-expanded', !isExpanded);
                navLinks.classList.toggle('active');
                hamburger.classList.toggle('active');
            });

            // Cerrar menú móvil al hacer clic en un enlace
            const navItems = document.querySelectorAll('.nav_links a');
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    if (navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        hamburger.classList.remove('active');
                        hamburger.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        }

        // Lógica inteligente para resaltar enlace activo
        const currentFilename = window.location.pathname.split('/').pop() || 'index.html';
        const navItems = document.querySelectorAll('.nav_links a');
        navItems.forEach(item => {
            const href = item.getAttribute('href') || '';
            const hrefFilename = href.split('/').pop().split('#')[0] || 'index.html';
            
            // Si el archivo del link coincide con el actual
            if (currentFilename === hrefFilename) {
                item.classList.add('active-link');
            }
        });
    }
}

// Cargar el header cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadHeader);