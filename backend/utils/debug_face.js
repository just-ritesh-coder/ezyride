const { compareFaces } = require('./faceMatch.js');
const path = require('path');
const fs = require('fs');

const run = async () => {
    // Get latest files (hardcoded or find dynamically)
    // We'll find the latest 'aadhaarFront' and 'selfie' in uploads/
    const uploadDir = path.join(__dirname, '../uploads');
    const files = fs.readdirSync(uploadDir);

    // Sort by time (heuristic: defaults to filename timestamp usually, or just stat)
    const sortedDetails = files.map(f => ({
        name: f,
        time: fs.statSync(path.join(uploadDir, f)).mtime.getTime()
    })).sort((a, b) => b.time - a.time);

    const selfie = sortedDetails.find(f => f.name.includes('selfie'));
    const aadhaar = sortedDetails.find(f => f.name.includes('aadhaarFront'));

    if (!selfie || !aadhaar) {
        console.log("Could not find latest selfie or aadhaarFront");
        return;
    }

    console.log(`Debugging Face Match for:`);
    console.log(`Selfie: ${selfie.name}`);
    console.log(`Doc: ${aadhaar.name}`);

    try {
        const result = await compareFaces(
            path.join(uploadDir, aadhaar.name),
            path.join(uploadDir, selfie.name)
        );
        console.log("RESULT:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("ERROR:", e);
    }
};

run();
