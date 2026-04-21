try {
    const tf = require('@tensorflow/tfjs');
    console.log('TFJS loaded');
    const faceapi = require('@vladmandic/face-api/dist/face-api.js');
    console.log('Face-api loaded');
} catch (e) {
    console.error('Full Error Stack:');
    console.error(e);
}
