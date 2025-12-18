const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
  { name: 'iphone.jpg', url: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=600&auto=format&fit=crop' },
  { name: 'macbook.jpg', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=600&auto=format&fit=crop' },
  { name: 'headphone.jpg', url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600&auto=format&fit=crop' },
  { name: 'mouse.jpg', url: 'https://images.unsplash.com/photo-1615663245857-acda5b2a15be?q=80&w=600&auto=format&fit=crop' },
  { name: 'kindle.jpg', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop' },
  { name: 'default.jpg', url: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=600&auto=format&fit=crop' }
];

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filepath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file async. (But we don't check the result)
      console.error(`Error downloading ${url}: ${err.message}`);
      reject(err);
    });
  });
};

async function downloadAll() {
  const dir = path.join(__dirname, '../public/images');
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }

  for (const img of images) {
    await downloadImage(img.url, path.join(dir, img.name));
  }
}

downloadAll();
