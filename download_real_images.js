const fs = require('fs');
const path = require('path');
const https = require('https');

const uploadDir = path.join(__dirname, 'pos-backend', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const images = {
    'beverage.jpg': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300&auto=format&fit=crop',
    'snack.jpg': 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?q=80&w=300&auto=format&fit=crop',
    'electronic.jpg': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=300&auto=format&fit=crop',
    'groceries.jpg': 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=300&auto=format&fit=crop',
    'bakery.jpg': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop',
    'clothing.jpg': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop',
    'fitness.jpg': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=300&auto=format&fit=crop',
    'office.jpg': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=300&auto=format&fit=crop'
};

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                // Handle redirects
                downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Request Failed with status: ${res.statusCode}`));
                return;
            }
            const fileStream = fs.createWriteStream(filepath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Successfully downloaded: ${path.basename(filepath)}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
};

async function main() {
    console.log("Starting real-world image downloads...");
    for (const [filename, url] of Object.entries(images)) {
        const filepath = path.join(uploadDir, filename);
        try {
            await downloadImage(url, filepath);
        } catch (err) {
            console.error(`Failed to download ${filename}:`, err.message);
        }
    }
    console.log("All downloads completed!");
}

main();
