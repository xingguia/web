const fs = require('fs');
const path = require('path');

const images = [
    { name: 'iphone.jpg', text: 'iPhone 15', color: '#a2c2e0' },
    { name: 'macbook.jpg', text: 'MacBook Pro', color: '#c7c7c7' },
    { name: 'headphone.jpg', text: 'Sony WH-1000XM5', color: '#333333' },
    { name: 'mouse.jpg', text: 'MX Master 3S', color: '#4a4a4a' },
    { name: 'kindle.jpg', text: 'Kindle', color: '#2c3e50' },
    { name: 'default.jpg', text: 'No Image', color: '#95a5a6' }
];

const dir = path.join(__dirname, '../public/images');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

function createSVG(text, color) {
    return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}"/>
  <text x="50%" y="50%" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dy=".3em">${text}</text>
</svg>`;
}

// Since our DB expects .jpg, but we are generating SVGs, we have a mismatch.
// Nginx serves files based on extension usually. 
// Browsers can display SVGs even if named .jpg (sometimes), but it's bad practice.
// Let's rename them to .svg in the file system AND update the DB to point to .svg

// Actually, let's just save them as .svg and run the DB update script again with .svg extensions.

images.forEach(img => {
    const svgContent = createSVG(img.text, img.color);
    // Changing extension to .svg
    const fileName = img.name.replace('.jpg', '.svg');
    fs.writeFileSync(path.join(dir, fileName), svgContent);
    console.log(`Generated ${fileName}`);
});
