const tf = require('@tensorflow/tfjs');
const canvas = require('canvas');
const path = require('path');
const fs = require('fs');

// Mock tfjs-node to use pure tfjs
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function() {
    if (arguments[0] === '@tensorflow/tfjs-node') {
        return tf;
    }
    return originalRequire.apply(this, arguments);
};

const faceapi = require('@vladmandic/face-api');

// Monkey-patch Node environment for face-api
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const run = async () => {
    try {
        console.log('📦 Setting up backend and loading models...');
        await tf.setBackend('cpu');
        await tf.ready();
        
        const modelPath = path.join(__dirname, 'models_weights');
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        console.log('✅ Models loaded');

        // Test with existing images in uploads/
        const uploadsDir = path.join(__dirname, 'uploads');
        const files = fs.readdirSync(uploadsDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
        
        if (files.length < 2) {
            console.log('Not enough images in uploads/ to test.');
            return;
        }

        const img1 = files[0];
        const img2 = files[1];
        console.log(`🔍 Comparing ${img1} and ${img2}...`);

        const image1 = await canvas.loadImage(path.join(uploadsDir, img1));
        const image2 = await canvas.loadImage(path.join(uploadsDir, img2));

        const detection1 = await faceapi.detectSingleFace(image1).withFaceLandmarks().withFaceDescriptor();
        const detection2 = await faceapi.detectSingleFace(image2).withFaceLandmarks().withFaceDescriptor();

        if (!detection1 || !detection2) {
            console.log('Face not detected in one of the images.');
            console.log('Det 1:', !!detection1, 'Det 2:', !!detection2);
            return;
        }

        const distance = faceapi.euclideanDistance(detection1.descriptor, detection2.descriptor);
        console.log('-----------------------------------');
        console.log('Euclidean Distance:', distance.toFixed(4));
        console.log('Match (threshold 0.6):', distance < 0.6 ? 'YES ✅' : 'NO ❌');
        console.log('-----------------------------------');

    } catch (e) {
        console.error('Failure:', e);
    }
};

run();
