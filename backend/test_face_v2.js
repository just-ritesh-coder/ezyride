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
        await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
        console.log('✅ Models loaded');

        // Specific files known to be reasonably sized
        const img1Path = path.join(__dirname, 'uploads', 'user-68b34a69b377d7f78973e33d-aadhaarFront-1770966463875.jpeg');
        const img2Path = path.join(__dirname, 'uploads', 'user-68b34a69b377d7f78973e33d-selfie-1770966463880.jpg');
        
        console.log(`🔍 Comparing:\n1: ${img1Path}\n2: ${img2Path}`);

        const image1 = await canvas.loadImage(img1Path);
        const image2 = await canvas.loadImage(img2Path);

        console.log('Detecting face 1...');
        const detection1 = await faceapi.detectSingleFace(image1).withFaceLandmarks().withFaceDescriptor();
        
        console.log('Detecting face 2...');
        const detection2 = await faceapi.detectSingleFace(image2).withFaceLandmarks().withFaceDescriptor();

        if (!detection1) {
            console.log('Face 1 not detected with SSD, trying TinyFaceDetector...');
            const det1Tiny = await faceapi.detectSingleFace(image1, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
            if (!det1Tiny) console.log('Face 1 still not detected.');
            else console.log('Face 1 detected with Tiny!');
        }
        
        if (!detection2) {
            console.log('Face 2 not detected with SSD, trying TinyFaceDetector...');
            const det2Tiny = await faceapi.detectSingleFace(image2, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
            if (!det2Tiny) console.log('Face 2 still not detected.');
            else console.log('Face 2 detected with Tiny!');
        }

        if (detection1 && detection2) {
            const distance = faceapi.euclideanDistance(detection1.descriptor, detection2.descriptor);
            console.log('-----------------------------------');
            console.log('Euclidean Distance:', distance.toFixed(4));
            console.log('Match (threshold 0.6):', distance < 0.6 ? 'YES ✅' : 'NO ❌');
            console.log('-----------------------------------');
        }

    } catch (e) {
        console.error('Failure:', e);
    }
};

run();
