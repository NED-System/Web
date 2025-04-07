// Script para registrar el Service Worker

// Esperar a que la página se cargue completamente
window.addEventListener('load', () => {
  console.log('Inicializando sistema de caché...');
  
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
});