const mongoose = require('mongoose');
const User = require('./backend/models/User');

mongoose.connect('mongodb://127.0.0.1:27017/ezyride')
    .then(async () => {
        console.log("Connected to DB");
        const users = await User.find().select('email fullName vehicleType');
        console.log(users);
        process.exit(0);
    })
    .catch(err => {
        console.error("DB Error", err);
        process.exit(1);
    });
