
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Ride = require('./models/Ride');
const User = require('./models/User');
require('dotenv').config();

async function checkCode() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const code = "285366";
        console.log(`Searching for booking with code: ${code}`);

        const booking = await Booking.findOne({ ride_start_code: code })
            .populate('ride')
            .populate('user');

        if (!booking) {
            console.log('No booking found with this code.');
        } else {
            console.log('Booking Found:');
            console.log(`- ID: ${booking._id}`);
            console.log(`- Ride ID: ${booking.ride._id}`);
            console.log(`- Booking Status: ${booking.status}`); // Should be 'confirmed'
            console.log(`- Code Used: ${booking.ride_start_code_used}`); // Should be false
            console.log(`- Ride Status: ${booking.ride.status}`); // Should be 'posted'
            console.log(`- Ride Driver: ${booking.ride.postedBy}`);
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

checkCode();
