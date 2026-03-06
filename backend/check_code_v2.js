
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Ride = require('./models/Ride');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const code = "285366";
    const b = await Booking.findOne({ ride_start_code: code }).populate('ride');

    if (!b) console.log("NO_BOOKING_FOUND");
    else {
        console.log(`BOOKING_ID: ${b._id}`);
        console.log(`RIDE_ID: ${b.ride._id}`);
        console.log(`BOOKING_STATUS: ${b.status}`);
        console.log(`CODE_USED: ${b.ride_start_code_used}`);
        console.log(`RIDE_STATUS: ${b.ride.status}`);
        console.log(`DRIVER_ID: ${b.ride.postedBy}`);
    }
    await mongoose.disconnect();
}
check();
