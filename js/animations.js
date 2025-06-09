document.addEventListener('DOMContentLoaded', function() {
    // Crear el observador de intersección
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Si el elemento es visible
            if (entry.isIntersecting) {
                // Añadir la clase visible para activar la animación
                entry.target.classList.add('visible');
                // Opcional: dejar de observar el elemento una vez que se ha animado
                // observer.unobserve(entry.target);
            }
        });
    }, {
        // Opciones del observador
        threshold: 0.2, // Activar cuando al menos el 20% del elemento es visible
        rootMargin: '0px' // Sin margen adicional
    });

    // Seleccionar todos los elementos que queremos animar
    const animatedElements = document.querySelectorAll('.fisico_digital, .gana_con_cada_dinamica, .negocios_preferidos');
    
    // Observar cada elemento
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}); 