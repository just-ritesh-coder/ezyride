const fs = require('fs');
const https = require('https');
const path = require('path');

const baseUrl = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';
const models = [
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2'
];

const download = (file) => {
    const filePath = path.join(__dirname, 'models_weights', file);
    const fileStream = fs.createWriteStream(filePath);

    console.log(`Downloading ${file}...`);
    https.get(baseUrl + file, (res) => {
        res.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Downloaded ${file}`);
        });
    }).on('error', (err) => {
        console.error(`Error downloading ${file}:`, err);
    });
};

models.forEach(download);
