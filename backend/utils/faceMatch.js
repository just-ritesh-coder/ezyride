const tf = require('@tensorflow/tfjs');
const canvas = require('canvas');
const path = require('path');
const fs = require('fs');

// Mock @tensorflow/tfjs-node to use pure @tensorflow/tfjs
// This bypasses the DLL loading errors on Node v24/Windows
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function() {
    if (arguments[0] === '@tensorflow/tfjs-node') {
        return tf;
    }
    return originalRequire.apply(this, arguments);
};

// Now load face-api, which will internally "require('@tensorflow/tfjs-node')"
// but receive our mocked pure JS version.
const faceapi = require('@vladmandic/face-api');

// Monkey-patch Node environment for face-api
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

/**
 * Load face-api models from disk (only once)
 */
const loadModels = async () => {
    if (modelsLoaded) return;
    const modelPath = path.join(__dirname, '..', 'models_weights');

    if (!fs.existsSync(modelPath)) {
        throw new Error(`Models directory not found: ${modelPath}`);
    }

    console.log('📦 Loading face-api models from', modelPath);
    await tf.setBackend('cpu');
    await tf.ready();
    
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
    
    modelsLoaded = true;
    console.log('✅ Face-api models loaded successfully');
};

/**
 * Load an image from disk into a canvas that face-api can process
 */
const loadImage = async (imgPath) => {
    const absolutePath = path.resolve(imgPath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`Image not found: ${absolutePath}`);
    }
    const img = await canvas.loadImage(absolutePath);
    return img;
};

/**
 * Compare two face images and return match result
 * @param {string} img1Path - Path to first image (Aadhaar front)
 * @param {string} img2Path - Path to second image (Selfie)
 * @returns {{ match: boolean, score: number, distance: number, error?: string }}
 */
const compareFaces = async (img1Path, img2Path) => {
    try {
        await loadModels();

        // Load both images
        const [image1, image2] = await Promise.all([
            loadImage(img1Path),
            loadImage(img2Path)
        ]);

        // Strategy: Try SSD MobileNet first, fallback to Tiny if needed
        let detection1 = await faceapi.detectSingleFace(image1).withFaceLandmarks().withFaceDescriptor();
        if (!detection1) {
            console.log('Face 1 not detected with SSD, trying Tiny...');
            detection1 = await faceapi.detectSingleFace(image1, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
        }

        let detection2 = await faceapi.detectSingleFace(image2).withFaceLandmarks().withFaceDescriptor();
        if (!detection2) {
            console.log('Face 2 not detected with SSD, trying Tiny...');
            detection2 = await faceapi.detectSingleFace(image2, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
        }

        if (!detection1) {
            return { match: false, score: 0, distance: 1, error: 'No face detected in Document (Aadhaar)' };
        }
        if (!detection2) {
            return { match: false, score: 0, distance: 1, error: 'No face detected in Selfie' };
        }

        // Calculate Euclidean distance between the two face descriptors
        const distance = faceapi.euclideanDistance(detection1.descriptor, detection2.descriptor);

        // Threshold: 0.6 is standard for face-api.js
        const threshold = 0.6;
        const isMatch = distance < threshold;

        // Convert distance to a human-readable score (0-100)
        // distance 0 = 100%, distance >= 1.0 = 0%
        const score = Math.max(0, Math.min(100, (1 - distance) * 100));

        console.log(`🔍 Face comparison: distance=${distance.toFixed(4)}, score=${score.toFixed(1)}%, match=${isMatch}`);

        return {
            match: isMatch,
            score: Math.round(score * 10) / 10,
            distance: Math.round(distance * 10000) / 10000,
            note: 'Real face comparison using facial embeddings'
        };

    } catch (err) {
        console.error('❌ Face comparison error:', err.message);
        return { match: false, score: 0, distance: 1, error: err.message };
    }
};

module.exports = { compareFaces };
