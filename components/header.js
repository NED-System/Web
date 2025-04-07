// Header component
const headerTemplate = document.createElement('template');
headerTemplate.innerHTML = `
    <header class="header">
        <nav class="nav" aria-label="Navegación principal">
            <div class="logo">
                <a href="/index.html#inicio" aria-label="Inicio">
                    <img src="/assets/logo/logoned.png" alt="NED logo" width="90" height="90">
                </a>
            </div>
            <button class="hamburger" aria-label="Menú" aria-expanded="false" aria-controls="nav-menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav_links" id="nav-menu" role="menu">
                <li role="none"><a href="/index.html#inicio" role="menuitem">Inicio</a></li>
                <li role="none"><a href="/pages/consumidores.html" role="menuitem">Consumidores</a></li>
                <li role="none"><a href="/pages/negocios.html" role="menuitem">Negocios</a></li>
                <li role="none"><a href="/pages/planes.html" role="menuitem">Planes</a></li>
            </ul>
        </nav>
    </header>
`;

function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.appendChild(headerTemplate.content.cloneNode(true));
        
        // Initialize hamburger menu functionality
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav_links');

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
                hamburger.setAttribute('aria-expanded', !isExpanded);
                navLinks.classList.toggle('active');
                hamburger.classList.toggle('active');
            });

            // Close mobile menu when clicking on a link
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
    }
}

// Load the header when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadHeader);