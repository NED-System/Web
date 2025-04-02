// Script para registrar el Service Worker
// TEMPORALMENTE DESACTIVADO DURANTE DESARROLLO

// Esperar a que la página se cargue completamente
window.addEventListener('load', () => {
  // CACHÉ DESACTIVADO TEMPORALMENTE
  console.log('Sistema de caché desactivado temporalmente durante el desarrollo.');
  
  // Desregistrar cualquier service worker existente
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for(let registration of registrations) {
        registration.unregister();
        console.log('Service Worker desregistrado correctamente.');
      }
    });
  }
  
  /* CÓDIGO ORIGINAL COMENTADO - RESTAURAR AL FINALIZAR EL PROYECTO
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration.scope);
      })
      .catch(error => {
        console.error('Error al registrar el Service Worker:', error);
      });
  } else {
    console.log('Service Workers no son soportados en este navegador.');
  }
  */
});