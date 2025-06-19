// Footer component
const footerTemplate = document.createElement('template');
footerTemplate.innerHTML = `
    <footer class="footer">
        <section class="footer_seccion">
            <div class="footer_content">
                <div class="footer_links">
                    <h3>INFORMACIÓN</h3>
                    <ul>
                        <li><a href="https://nedmobi.notion.site/1a20e0b664ca807c87e5e4a5c7775933?pvs=105" target="_blank" rel="noopener noreferrer">Únete a la lista de espera</a></li>
                        <li><a href="https://nedmobi.notion.site/1990e0b664ca80c18d2ddc5de0099f95?pvs=105" target="_blank" rel="noopener noreferrer">Ir al formulario de contacto</a></li>
                        <li><a href="https://nedmobi.notion.site/1990e0b664ca8049b323ed327d1eca70?pvs=105" target="_blank" rel="noopener noreferrer">Registra aquí tu cupón</a></li>
                        <li><a href="https://linktr.ee/nedleal" target="_blank" rel="noopener noreferrer">Redes sociales</a></li>
                        <li><a href="https://play.google.com/store/apps/details?id=com.nedsystem.movil" target="_blank" rel="noopener noreferrer">Descarga la app android</a></li>
                    </ul>
                </div>
                <div class="footer_links">
                    <h3>PÁGINAS</h3>
                    <ul>
                        <li><a href="/index.html">Inicio</a></li>
                        <li><a href="/pages/consumidores.html">Consumidores</a></li>
                        <li><a href="/pages/negocios.html">Negocios</a></li>
                        <li><a href="/pages/planes.html">Planes</a></li>
                    </ul>
                </div>
                <div class="footer_links">
                    <h3>CONSULTAS</h3>
                    <ul>
                        <li><a href="/pages/terminosycondiciones.html">Términos & Condiciones de uso</a></li>
                        <li><a href="/pages/privacidad.html">Política de privacidad</a></li>
                        <li><a href="/pages/eliminadatos.html">Política eliminación de datos</a></li>
                        <li><a href="https://nedmobi.notion.site/1990e0b664ca80c18d2ddc5de0099f95?pvs=105" target="_blank" rel="noopener noreferrer">Ir al formulario de contacto</a></li>
                    </ul>
                </div>
                <div class="footer__suscribirse">
                    <p>Te compartimos historias, ejemplos de otros negocios, experiencias de clientes, información útil y mas…</p>
                    <a href="https://nedmobi.notion.site/1990e0b664ca80deae99f06d63544e81?pvs=105" class="unirme_button" target="_blank" rel="noopener noreferrer" aria-label="Suscribirse al boletín">Suscribirme</a>
                </div>
            </div>
            <div class="footer_bottom">
                <p>&copy; 2025 - NED System S.A.S. Todos los derechos reservados.</p>
            </div>
        </section>
    </footer>
`;

function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.appendChild(footerTemplate.content.cloneNode(true));
    }
}

// Load the footer when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadFooter);