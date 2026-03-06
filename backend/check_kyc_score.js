const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const user = await User.findOne({ 'kyc.status': { $in: ['pending', 'rejected', 'verified'] } })
            .sort({ 'kyc.submittedAt': -1 });

        if (user) {
            console.log("--------------------------------------------------");
            console.log(`User: ${user.email}`);
            console.log(`KYC Status: ${user.kyc.status}`);
            console.log(`Match Score: ${user.kyc.matchScore}`);
            console.log("--------------------------------------------------");
        } else {
            console.log("No users with KYC found.");
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
