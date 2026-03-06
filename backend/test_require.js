try {
    console.log("Loading canvas...");
    require('canvas');
    console.log("Canvas loaded successfully.");

    console.log("Loading faceMatch...");
    require('./utils/faceMatch');
    console.log("Success!");
} catch (e) {
    console.error("Failed:", e.message);
    console.error("Code:", e.code);
    if (e.requireStack) console.error("Stack:", e.requireStack);
}
