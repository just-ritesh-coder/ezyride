try {
    console.log("Require ./utils/faceMatch");
    const m = require('./utils/faceMatch');
    console.log("Loaded keys:", Object.keys(m));
} catch (e) {
    console.error("Error:", e);
    console.error("Stack:", e.stack);
}
