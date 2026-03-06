
const mongoose = require('mongoose');
const Booking = require('../backend/models/Booking');
const Ride = require('../backend/models/Ride');
const User = require('../backend/models/User');
require('dotenv').config({ path: '../backend/.env' });

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
            console.log(`- Status: ${booking.status}`); // Should be 'confirmed'
            console.log(`- Code Used: ${booking.ride_start_code_used}`); // Should be false
            console.log(`- Ride Status: ${booking.ride.status}`); // Should be 'posted'
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

checkCode();
