const fs = require('fs');
const path = require('path');

// Directorios a escanear en búsqueda de archivos HTML
const dirsToScan = [
  './',          // Raíz del proyecto (donde está index.html)
  './pages'      // Carpeta de páginas internas
];

// Función para obtener todos los archivos HTML en los directorios seleccionados
function getHtmlFiles() {
  let htmlFiles = [];
  dirsToScan.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (path.extname(file) === '.html') {
          htmlFiles.push(path.join(dir, file));
        }
      });
    }
  });
  return htmlFiles;
}

// Función para buscar la versión actual del CSS en index.html e incrementarla
function getNextVersion(htmlFiles, manualVersion) {
  if (manualVersion) {
    return manualVersion;
  }

  // Intentamos leer el index.html para buscar la versión actual
  const indexPath = './index.html';
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    // Busca patrones como ?v=1.1, ?v=2.04, etc.
    const match = content.match(/\.css\?v=(\d+\.\d+)/);
    if (match && match[1]) {
      const currentVersion = parseFloat(match[1]);
      if (!isNaN(currentVersion)) {
        // Incrementa la versión por 0.1 y arregla problemas de precisión decimal
        const nextVersion = (currentVersion + 0.1).toFixed(1);
        return nextVersion;
      }
    }
  }

  // Si no se encuentra index.html o no tiene versión, usamos un timestamp único
  return Date.now().toString();
}

function run() {
  const manualVersion = process.argv[2]; // Captura si el usuario escribe: node bump-version.js 1.5
  const htmlFiles = getHtmlFiles();
  
  if (htmlFiles.length === 0) {
    console.log('⚠️ No se encontraron archivos HTML.');
    return;
  }

  const nextVersion = getNextVersion(htmlFiles, manualVersion);
  console.log(`🚀 Iniciando actualización a la versión: v=${nextVersion}`);

  // Expresión regular para buscar enlaces a .css, .js e imágenes que ya tengan un parámetro de versión ?v=...
  // Ejemplos: style.css?v=1.1, main.js?v=2.0, logo.png?v=1.0
  const assetRegex = /(\.(?:css|js|png|jpg|jpeg|svg|webp|avif|gif|ico))\?v=[a-zA-Z0-9.-]+/g;

  let updatedCount = 0;

  htmlFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Comprobamos si el archivo tiene recursos que necesiten actualizarse
      if (assetRegex.test(content)) {
        // Reemplazamos todos los ?v=... por ?v=nueva_version
        const updatedContent = content.replace(assetRegex, `$1?v=${nextVersion}`);
        
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ Actualizado: ${filePath}`);
        updatedCount++;
      } else {
        console.log(`ℹ️ Sin cambios necesarios (no se encontraron assets con ?v=): ${filePath}`);
      }
    } catch (err) {
      console.error(`❌ Error procesando el archivo ${filePath}:`, err.message);
    }
  });

  console.log(`\n🎉 ¡Listo! Se actualizaron ${updatedCount} archivos HTML a la versión v=${nextVersion}.`);
}

run();
