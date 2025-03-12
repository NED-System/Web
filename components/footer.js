// Footer component
const footerTemplate = document.createElement('template');
footerTemplate.innerHTML = `
    <footer class="footer">
        <section class="footer_seccion">
            <div class="footer_content">
                <div class="footer_links">
                    <h3>INFORMACIÓN</h3>
                    <ul>
                        <li><a href="https://nedmobi.notion.site/1a20e0b664ca807c87e5e4a5c7775933">Únete a la lista de espera</a></li>
                        <li><a href="#programa">Ir al formulario de contacto</a></li>
                        <li><a href="#beneficios">Registra aquí tu cupón</a></li>
                        <li><a href="#contacto">Redes sociales</a></li>
                    </ul>
                </div>
                <div class="footer_links">
                    <h3>PÁGINAS</h3>
                    <ul>
                        <li><a href="index.html#inicio">Inicio</a></li>
                        <li><a href="index.html#programa">Consumidores</a></li>
                        <li><a href="index.html#beneficios">Negocios</a></li>
                        <li><a href="index.html#contacto">Planes</a></li>
                    </ul>
                </div>
                <div class="footer_links">
                    <h3>CONSULTAS</h3>
                    <ul>
                        <li><a href="#inicio">Términos & Condiciones de uso</a></li>
                        <li><a href="#programa">Política de privacidad</a></li>
                        <li><a href="#beneficios">Ir al formulario de contacto</a></li>
                    </ul>
                </div>
                <div class="footer__suscribirse">
                    <p>Nos gustaría compartir contigo historias, ejemplos de otros comercios, información útil y mas…</p>
                    <button class="unirme_button" aria-label="Suscribirse al boletín">SUSCRIBIRME</button>
                </div>
            </div>
            <div class="footer_bottom">
                <p>&copy; 2025 NED System S.A.S. Todos los derechos reservados.</p>
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