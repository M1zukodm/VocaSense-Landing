// save as: optimize-all-videos.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VIDEO_DIR = 'assets/media';
const OUTPUT_VIDEO_DIR = 'assets/media/optimized';

if (!fs.existsSync(OUTPUT_VIDEO_DIR)) {
    fs.mkdirSync(OUTPUT_VIDEO_DIR, { recursive: true });
}

// Obtener lista de videos originales
const originalVideos = fs.readdirSync(VIDEO_DIR)
    .filter(file => /\.(mp4|mov|avi|mkv)$/i.test(file))
    .map(file => ({
        name: file,
        path: path.join(VIDEO_DIR, file),
        stats: fs.statSync(path.join(VIDEO_DIR, file))
    }));

// Obtener lista de videos ya optimizados (para comparar)
let optimizedFiles = [];
if (fs.existsSync(OUTPUT_VIDEO_DIR)) {
    optimizedFiles = fs.readdirSync(OUTPUT_VIDEO_DIR);
}

console.log('🎥 Analizando videos...\n');

// Función para verificar si un video necesita procesamiento
function needsProcessing(originalVideo, videoName) {
    const baseName = path.parse(videoName).name;
    
    // Verificar si es video hero (tiene múltiples versiones)
    if (videoName.includes('romix') || videoName.includes('hero')) {
        const versions = [
            `${baseName}.mp4`,
            `${baseName}_mobile.mp4`,
            `${baseName}.webm`
        ];
        return versions.some(version => !optimizedFiles.includes(version));
    }
    
    // Verificar si es video tutorial (tiene thumbnails)
    if (videoName.includes('Voca') || videoName.includes('stereo') || videoName.includes('romi')) {
        const versions = [
            `${baseName}.mp4`,
            `${baseName}_thumb.jpg`,
            `${baseName}_poster.jpg`
        ];
        return versions.some(version => !optimizedFiles.includes(version));
    }
    
    // Para videos básicos, verificar si el archivo optimizado existe y es más reciente
    const optimizedPath = path.join(OUTPUT_VIDEO_DIR, videoName);
    if (!fs.existsSync(optimizedPath)) {
        return true;
    }
    
    const optimizedStats = fs.statSync(optimizedPath);
    return originalVideo.stats.mtimeMs > optimizedStats.mtimeMs;
}

// Filtrar solo videos que necesitan procesamiento
const videosToProcess = originalVideos.filter(video => 
    needsProcessing(video, video.name)
);

if (videosToProcess.length === 0) {
    console.log('✅ Todos los videos ya están optimizados y actualizados.');
    console.log('💡 Para reprocesar todo, borra la carpeta "optimized" o los archivos específicos.');
    process.exit(0);
}

console.log(`📊 Procesando ${videosToProcess.length} de ${originalVideos.length} videos...\n`);

videosToProcess.forEach(video => {
    const inputPath = video.path;
    const name = path.parse(video.name).name;
    const ext = path.parse(video.name).ext;
    const fullName = video.name;
    
    console.log(`🔄 Procesando: ${fullName}`);
    
    try {
        // Eliminar versiones antiguas si existen
        const basePattern = path.join(OUTPUT_VIDEO_DIR, name);
        const patterns = [
            `${basePattern}.*`,
            `${basePattern}_mobile.*`,
            `${basePattern}_thumb.*`,
            `${basePattern}_poster.*`
        ];
        
        // Buscar y eliminar archivos antiguos relacionados
        optimizedFiles.forEach(file => {
            if (file.startsWith(name)) {
                const filePath = path.join(OUTPUT_VIDEO_DIR, file);
                fs.unlinkSync(filePath);
                console.log(`  🗑️  Eliminado versión anterior: ${file}`);
            }
        });
        
        // Clasificar videos según su uso
        if (fullName.includes('romix') || fullName.includes('hero')) {
            // Video hero: múltiples versiones
            optimizeHeroVideo(inputPath, name);
        } else if (fullName.includes('Voca') || fullName.includes('stereo') || fullName.includes('romi')) {
            // Videos tutoriales: optimizados para lazy loading
            optimizeTutorialVideo(inputPath, name);
        } else {
            // Otros videos: versión básica
            optimizeBasicVideo(inputPath, name, ext);
        }
        
    } catch (error) {
        console.error(`  ❌ Error con ${fullName}:`, error.message);
    }
});

console.log('\n🎬 Procesamiento completado!');

// ================= FUNCIONES =================

function optimizeHeroVideo(inputPath, name) {
    console.log(`  🔹 Video hero detectado: ${name}`);
    
    // Versión desktop (1080p)
    const desktopCmd = `ffmpeg -i "${inputPath}" \
        -c:v libx264 -crf 23 -preset medium \
        -vf "scale='min(1920,iw)':-2" \
        -c:a aac -b:a 128k \
        -movflags +faststart \
        -profile:v high -level 4.0 \
        "${OUTPUT_VIDEO_DIR}/${name}.mp4" -y`;
    
    // Versión móvil (720p)
    const mobileCmd = `ffmpeg -i "${inputPath}" \
        -c:v libx264 -crf 28 -preset faster \
        -vf "scale='min(720,iw)':-2" \
        -c:a aac -b:a 96k \
        -movflags +faststart \
        "${OUTPUT_VIDEO_DIR}/${name}_mobile.mp4" -y`;
    
    // Versión WebM (para Chrome)
    const webmCmd = `ffmpeg -i "${inputPath}" \
        -c:v libvpx-vp9 -crf 30 -b:v 0 \
        -vf "scale='min(1920,iw)':-2" \
        -c:a libopus -b:a 128k \
        -speed 2 \
        "${OUTPUT_VIDEO_DIR}/${name}.webm" -y`;
    
    execSync(desktopCmd);
    execSync(mobileCmd);
    execSync(webmCmd);
    
    console.log(`  ✅ Generadas 3 versiones para ${name}`);
}

function optimizeTutorialVideo(inputPath, name) {
    console.log(`  🔹 Video tutorial detectado: ${name}`);
    
    // Para tutoriales: versión optimizada + thumbnail
    const outputPath = path.join(OUTPUT_VIDEO_DIR, `${name}.mp4`);
    
    // Comando de optimización (720p máximo, buena compresión)
    const cmd = `ffmpeg -i "${inputPath}" \
        -c:v libx264 -crf 28 -preset faster \
        -vf "scale='min(720,iw)':-2" \
        -c:a aac -b:a 64k \
        -movflags +faststart \
        -profile:v baseline -level 3.1 \
        "${outputPath}" -y`;
    
    // Generar thumbnail
    const thumbCmd = `ffmpeg -i "${inputPath}" \
        -ss 00:00:02 -frames:v 1 \
        -vf "scale=400:-1" \
        "${OUTPUT_VIDEO_DIR}/${name}_thumb.jpg" -y`;
    
    // Generar poster (frame inicial)
    const posterCmd = `ffmpeg -i "${inputPath}" \
        -ss 00:00:01 -frames:v 1 \
        -vf "scale=800:-1" \
        "${OUTPUT_VIDEO_DIR}/${name}_poster.jpg" -y`;
    
    execSync(cmd);
    execSync(thumbCmd);
    execSync(posterCmd);
    
    // Calcular tamaño original vs optimizado
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`  ✅ Optimizado: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${reduction}% reducido)`);
}

function optimizeBasicVideo(inputPath, name, ext) {
    const outputPath = path.join(OUTPUT_VIDEO_DIR, `${name}${ext}`);
    
    const cmd = `ffmpeg -i "${inputPath}" \
        -c:v libx264 -crf 25 -preset fast \
        -c:a aac -b:a 96k \
        -movflags +faststart \
        "${outputPath}" -y`;
    
    execSync(cmd);
    
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`  ✅ Optimizado: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${reduction}% reducido)`);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Resumen final
console.log('\n📊 Resumen final:');
const originalTotal = getFolderSize(VIDEO_DIR);
const optimizedTotal = getFolderSize(OUTPUT_VIDEO_DIR);
const totalReduction = ((originalTotal - optimizedTotal) / originalTotal * 100).toFixed(1);

console.log(`Tamaño original: ${formatBytes(originalTotal)}`);
console.log(`Tamaño optimizado: ${formatBytes(optimizedTotal)}`);
console.log(`Ahorro total: ${totalReduction}%\n`);

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