const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VIDEO_DIR = 'assets/media';
const OUTPUT_VIDEO_DIR = 'assets/media/optimized';

if (!fs.existsSync(OUTPUT_VIDEO_DIR)) {
    fs.mkdirSync(OUTPUT_VIDEO_DIR, { recursive: true });
}

const videos = fs.readdirSync(VIDEO_DIR)
    .filter(file => /\.(mp4|mov|avi|mkv)$/i.test(file));

console.log('🎥 Optimizando videos...\n');

videos.forEach(video => {
    const inputPath = path.join(VIDEO_DIR, video);
    const outputPath = path.join(OUTPUT_VIDEO_DIR, video);
    const name = path.parse(video).name;
    
    console.log(`Procesando: ${video}`);
    
    try {
        // Para videos grandes (como romix.MP4), crear versión móvil
        if (video.includes('romix') || video.includes('hero')) {
            // Versión móvil comprimida
            const mobilePath = path.join(OUTPUT_VIDEO_DIR, `${name}_mobile.mp4`);
            
            // Comando FFmpeg para optimizar video para web
            const command = `ffmpeg -i "${inputPath}" \
                -c:v libx264 -crf 28 -preset medium \
                -c:a aac -b:a 128k \
                -vf "scale='min(1920,iw)':-2" \
                -movflags +faststart \
                "${outputPath}" -y`;
            
            // Versión móvil más pequeña
            const mobileCommand = `ffmpeg -i "${inputPath}" \
                -c:v libx264 -crf 30 -preset faster \
                -c:a aac -b:a 96k \
                -vf "scale='min(720,iw)':-2" \
                -movflags +faststart \
                "${mobilePath}" -y`;
            
            execSync(command, { stdio: 'inherit' });
            execSync(mobileCommand, { stdio: 'inherit' });
            
            console.log(`  ✅ Creado: ${name}.mp4 (desktop)`);
            console.log(`  ✅ Creado: ${name}_mobile.mp4 (móvil)`);
        } else {
            // Para otros videos, solo comprimir
            const command = `ffmpeg -i "${inputPath}" \
                -c:v libx264 -crf 25 -preset fast \
                -c:a aac -b:a 128k \
                -movflags +faststart \
                "${outputPath}" -y`;
            
            execSync(command, { stdio: 'inherit' });
            console.log(`  ✅ Optimizado: ${video}`);
        }
        
    } catch (error) {
        console.error(`  ❌ Error con ${video}:`, error.message);
    }
});

console.log('\n🎬 Todos los videos optimizados!');