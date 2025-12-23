const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const sharp = require('sharp');

// Configuración
const IMG_DIR = 'assets/img';
const MEDIA_DIR = 'assets/media';
const OUTPUT_WEBP_DIR = 'assets/img/webp';
const OUTPUT_OPTIMIZED_DIR = 'assets/img/optimized';

// Crear directorios si no existen
[OUTPUT_WEBP_DIR, OUTPUT_OPTIMIZED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function optimizeImages() {
    const images = fs.readdirSync(IMG_DIR)
        .filter(file => /\.(png|jpg|jpeg)$/i.test(file));

    for (const image of images) {
        const inputPath = path.join(IMG_DIR, image);
        const name = path.parse(image).name;
        
        console.log(`Procesando: ${image}`);
        
        try {
            // 1. Redimensionar imagen grande si es necesario
            const stats = fs.statSync(inputPath);
            const statsMB = stats.size / (1024 * 1024);
            
            if (statsMB > 1) { // Si la imagen es > 1MB
                console.log(`  🔍 Imagen grande detectada: ${statsMB.toFixed(2)}MB`);
                
                // Redimensionar a máximo 1200px manteniendo aspecto
                await sharp(inputPath)
                    .resize(1200, 1200, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .toFile(path.join(OUTPUT_OPTIMIZED_DIR, `${name}_opt.jpg`));
            }
            
            // 2. Convertir a WebP
            await sharp(inputPath)
                .webp({ 
                    quality: 80, 
                    effort: 6, // Máxima compresión
                    smartSubsample: true 
                })
                .toFile(path.join(OUTPUT_WEBP_DIR, `${name}.webp`));
                
            console.log(`  ✅ Optimizado: ${name}.webp`);
            
        } catch (error) {
            console.error(`  ❌ Error procesando ${image}:`, error.message);
        }
    }
    
    console.log('\n📊 Resumen de optimización:');
    console.log('===========================');
    
    // Mostrar estadísticas
    const originalSize = getFolderSize(IMG_DIR);
    const webpSize = getFolderSize(OUTPUT_WEBP_DIR);
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
    
    console.log(`Tamaño original: ${formatBytes(originalSize)}`);
    console.log(`Tamaño WebP: ${formatBytes(webpSize)}`);
    console.log(`Ahorro: ${savings}%`);
}

function getFolderSize(dir) {
    let totalSize = 0;
    
    function scan(directory) {
        const files = fs.readdirSync(directory);
        
        files.forEach(file => {
            const filePath = path.join(directory, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                scan(filePath);
            } else {
                totalSize += stats.size;
            }
        });
    }
    
    scan(dir);
    return totalSize;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Ejecutar
optimizeImages();