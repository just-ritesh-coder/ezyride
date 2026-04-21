// Quick test: verify that faceMatch.js loads and models can be initialized
const { compareFaces } = require('./utils/faceMatch');
const path = require('path');
const fs = require('fs');

const run = async () => {
    console.log('Testing faceMatch.js module loading...');
    
    // Find any two uploaded images to test with
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    
    if (files.length < 2) {
        console.log('Need at least 2 images in uploads/ to test. Found:', files.length);
        console.log('Module loaded OK. Skipping comparison test.');
        return;
    }

    // Pick an aadhaar and a selfie if possible
    const aadhaar = files.find(f => f.includes('aadhaarFront')) || files[0];
    const selfie = files.find(f => f.includes('selfie')) || files[1];
    
    console.log('Comparing:', aadhaar, 'vs', selfie);
    
    const result = await compareFaces(
        path.join(uploadsDir, aadhaar),
        path.join(uploadsDir, selfie)
    );
    
    console.log('Result:', JSON.stringify(result, null, 2));
};

run().catch(e => console.error('Test failed:', e));
