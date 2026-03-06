const { spawn } = require('child_process');
const path = require('path');

/**
 * Compare two images using Python script (face_recognition lib)
 */
const compareFaces = (img1Path, img2Path) => {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, 'verify_face.py');
        // Ensure paths are absolute or handled correctly by python
        const proc = spawn('python', [pythonScript, img1Path, img2Path]);

        let dataString = '';
        let errorString = '';

        proc.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        proc.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        proc.on('close', (code) => {
            if (code !== 0) {
                console.error('Python script error:', errorString);
                // Return a safe fallback or error logic
                // If python fails completely, we can return error entry
                return resolve({ match: false, score: 0, error: 'Verification system error' });
            }
            try {
                const result = JSON.parse(dataString);
                resolve(result); // { match: bool, score: number, error?: string }
            } catch (e) {
                console.error('JSON Parse error:', dataString);
                resolve({ match: false, score: 0, error: 'Invalid response from verification' });
            }
        });
    });
};

module.exports = { compareFaces };
