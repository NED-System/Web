document.addEventListener('DOMContentLoaded', function() {
    // Función para crear efecto de máquina de escribir
    function typewriterEffect(element, text, speed = 120) {
        // Guardar el texto original
        const originalText = text;
        // Vaciar el elemento
        element.textContent = '';
        
        let i = 0;
        // Función para añadir caracteres uno por uno
        function addCharacter() {
            if (i < originalText.length) {
                element.textContent += originalText.charAt(i);
                i++;
                setTimeout(addCharacter, speed);
            }
        }
        
        // Iniciar la animación
        addCharacter();
    }
    
    // Create an Intersection Observer instance for zoom animation
    const zoomObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When the image comes into view
            if (entry.isIntersecting) {
                // Add the animation class to trigger the zoom effect
                entry.target.classList.add('zoom-animation');
                
                // Remove the observer after animation is triggered once
                // Comment this line if you want the animation to happen every time the element comes into view
                // observer.unobserve(entry.target);
            } else {
                // Remove the class when the image is out of view
                // This allows the animation to play again when scrolling back
                entry.target.classList.remove('zoom-animation');
            }
        });
    }, {
        // Options for the observer
        threshold: 0.5, // Trigger when 50% of the element is visible
        rootMargin: '0px' // No margin around the root
    });

    // Target the image with the tipos_de_negocio_img class
    const targetImage = document.querySelector('.tipos_de_negocio_img');
    
    // If the image exists, observe it
    if (targetImage) {
        zoomObserver.observe(targetImage);
    }
    
    // Create an Intersection Observer instance for slide-up animation
    const slideUpObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When the image comes into view
            if (entry.isIntersecting) {
                // Add the animation class to trigger the slide-up effect
                entry.target.classList.add('slide-up-animation');
            } else {
                // Remove the class when the image is out of view
                // This allows the animation to play again when scrolling back
                entry.target.classList.remove('slide-up-animation');
            }
        });
    }, {
        threshold: 0.2, // Trigger when 20% of the element is visible
        rootMargin: '10px'
    });

    // Target the images with the queVeranTusClientes_img classes and nuevoCliente-phone
    const clientesImages = document.querySelectorAll('.queVeranTusClientes_img_1, .queVeranTusClientes_img_2, .dinamicas-phone, .dinamicas-phone-alianzas');

    // If images exist, observe them
    if (clientesImages.length > 0) {
        clientesImages.forEach(image => {
            slideUpObserver.observe(image);
        });
    }
    
    // Create an Intersection Observer instance for typewriter effect
    const typewriterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When the text element comes into view
            if (entry.isIntersecting) {
                // Get the original text and apply typewriter effect
                const originalText = entry.target.getAttribute('data-text') || entry.target.textContent;
                // Store the original text if not already stored
                if (!entry.target.getAttribute('data-text')) {
                    entry.target.setAttribute('data-text', originalText);
                }
                // Apply typewriter effect
                typewriterEffect(entry.target, originalText);
                // Stop observing after triggering the animation once
                typewriterObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.7, // Trigger when 70% of the element is visible
        rootMargin: '0px'
    });
    
    // Target the text element with ID 'texto_mejor_experiencia'
    const typewriterText = document.getElementById('texto_mejor_experiencia');
    
    // If the text element exists, observe it
    if (typewriterText) {
        typewriterObserver.observe(typewriterText);
    }
});