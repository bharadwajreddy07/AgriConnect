const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
    // Pulses - definitely need distinct images
    { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Green_gram.jpg/640px-Green_gram.jpg', filename: 'greengram.jpg' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Black_gram.jpg/640px-Black_gram.jpg', filename: 'blackgram.jpg' },

    // Vegetables - Fix Cabbage duplicates
    { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Watermelon_cross.jpg/640px-Watermelon_cross.jpg', filename: 'watermelon.png' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Okra_pod.jpg/640px-Okra_pod.jpg', filename: 'okra.png' },

    // Spices - Fix Turmeric
    { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Turmeric_rhizome.jpg/640px-Turmeric_rhizome.jpg', filename: 'turmeric.png' },

    // Fix Lentils (if it was paddy)
    { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Red_Lentils.jpg/640px-Red_Lentils.jpg', filename: 'lentils.png' }
];

const downloadImage = (url, filename) => {
    const dest = path.join('d:\\AgriMart\\frontend\\public\\images\\crops', filename);
    const file = fs.createWriteStream(dest);

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
            return downloadImage(response.headers.location, filename);
        }
        if (response.statusCode !== 200) {
            console.error(`Failed ${filename}: ${response.statusCode}`);
            file.close();
            return;
        }
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Fixed ${filename}`);
        });
    }).on('error', (err) => {
        fs.unlink(dest, () => { });
        console.error(`Error ${filename}: ${err.message}`);
    });
};

images.forEach(img => downloadImage(img.url, img.filename));
