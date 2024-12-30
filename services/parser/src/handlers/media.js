const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

async function processMedia(data, redis) {
    const { type, path: filePath } = data;
    const ext = path.extname(filePath).toLowerCase();
    const outputPath = '/shared/media/full';
    const thumbnailPath = '/shared/media/thumbnails';
    
    // Create directories if they don't exist
    [outputPath, thumbnailPath].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    if (['.mp4', '.avi', '.mov'].includes(ext)) {
        await processVideo(filePath, outputPath, thumbnailPath);
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        await processImage(filePath, outputPath, thumbnailPath);
    } else {
        // Copy other files directly
        fs.copyFileSync(filePath, path.join(outputPath, path.basename(filePath)));
    }
}

async function processVideo(filePath, outputPath, thumbnailPath) {
    const fileName = path.basename(filePath);
    const outputFile = path.join(outputPath, fileName);
    const thumbnailFile = path.join(thumbnailPath, `${path.parse(fileName).name}.jpg`);

    // Copy video
    fs.copyFileSync(filePath, outputFile);

    // Generate thumbnail
    return new Promise((resolve, reject) => {
        ffmpeg(filePath)
            .screenshots({
                timestamps: [1],
                filename: path.basename(thumbnailFile),
                folder: thumbnailPath,
                size: '320x240'
            })
            .on('end', resolve)
            .on('error', reject);
    });
}

async function processImage(filePath, outputPath, thumbnailPath) {
    const fileName = path.basename(filePath);
    
    // Process full size
    await sharp(filePath)
        .resize(1024, 1024, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .toFile(path.join(outputPath, fileName));

    // Generate thumbnail
    await sharp(filePath)
        .resize(200, 200, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .toFile(path.join(thumbnailPath, fileName));
}

module.exports = { processMedia }; 