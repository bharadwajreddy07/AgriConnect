const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Green_gram.jpg', filename: 'greengram.jpg' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Black_gram.jpg', filename: 'blackgram.jpg' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chickpeas_.jpg/640px-Chickpeas_.jpg', filename: 'chickpeas.jpg' }, // Keep this one, it might have worked? If not, try another
    { url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Pigeon_peas.jpg', filename: 'pigeonpea.jpg' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Jute_fibre_extraction.jpg', filename: 'jute.jpg' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Barley_grains.jpg', filename: 'barley.jpg' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Ginger_Root.jpg', filename: 'ginger.jpg' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Garlic_bulb.jpg', filename: 'garlic.jpg' }
];

const downloadImage = (url, filename) => {
    const dest = path.join('d:\\AgriMart\\frontend\\public\\images\\crops', filename);
    const file = fs.createWriteStream(dest);

    const request = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
        // Handle Redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
            console.log(`Redirecting ${filename} to ${response.headers.location}`);
            return downloadImage(response.headers.location, filename);
        }

        if (response.statusCode !== 200) {
            console.error(`Failed to download ${filename}: Status Code ${response.statusCode}`);
            file.close();
            fs.unlink(dest, () => { });
            return;
        }

        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${filename} (${response.headers['content-length']} bytes)`);
        });
    }).on('error', (err) => {
        fs.unlink(dest, () => { });
        console.error(`Error downloading ${filename}: ${err.message}`);
    });
};

images.forEach(img => downloadImage(img.url, img.filename));
