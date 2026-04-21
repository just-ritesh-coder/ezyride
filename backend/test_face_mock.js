const tf = require('@tensorflow/tfjs');

// Mock tfjs-node to use pure tfjs
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function() {
    if (arguments[0] === '@tensorflow/tfjs-node') {
        return tf;
    }
    return originalRequire.apply(this, arguments);
};

try {
    const faceapi = require('@vladmandic/face-api');
    console.log('Face-api node build loaded successfully');
    console.log('Backend:', faceapi.tf.getBackend());
} catch (e) {
    console.error('Error:', e.message);
    if (e.stack) console.error(e.stack);
}
