const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'node_modules/@vladmandic/face-api/model');
const destDir = path.join(__dirname, 'models_weights');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

const files = fs.readdirSync(srcDir);

files.forEach(file => {
    if (file.endsWith('.json') || file.endsWith('.bin')) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
        console.log(`Copied ${file}`);
    }
});
