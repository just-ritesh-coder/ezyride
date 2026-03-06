const axios = require('axios');

const loginAndPost = async () => {
    try {
        const email = `driver${Date.now()}@test.com`;
        console.log("Registering User");
        const authRes = await axios.post('http://localhost:5000/api/auth/register', {
            fullName: 'Test Driver',
            phone: '9999999999',
            email: email,
            password: 'password123',
            vehicleType: 'Two-Wheeler'
        });

        const token = authRes.data.token;
        console.log("Posting ride");

        const rideRes = await axios.post('http://localhost:5000/api/rides', {
            from: 'Location A',
            to: 'Location B',
            seatsAvailable: 1,
            pricePerSeat: 100,
            notes: '',
            date: new Date(Date.now() + 86400000).toISOString()
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("Publish Ride Res:", rideRes.status, rideRes.data);
    } catch (e) {
        console.error("Error Status:", e.response?.status);
        console.error("Error Data:", e.response?.data);
    }
}
loginAndPost();
