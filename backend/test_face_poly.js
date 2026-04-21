const util = require('util');
global.util = util;
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;

try {
    const tf = require('@tensorflow/tfjs');
    console.log('TFJS loaded');
    const faceapi = require('@vladmandic/face-api/dist/face-api.js');
    console.log('Face-api loaded');
} catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
}
