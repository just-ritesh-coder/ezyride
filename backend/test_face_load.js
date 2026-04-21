// Node.js polyfills for face-api
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

try {
    const tf = require('@tensorflow/tfjs');
    console.log('TFJS loaded');
    const faceapi = require('@vladmandic/face-api/dist/face-api.js');
    console.log('Face-api loaded. Keys:', Object.keys(faceapi.nets).slice(0, 3));
} catch (e) {
    console.error('Error:', e.message);
}
