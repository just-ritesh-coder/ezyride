const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    
    // First, downgrade everyone to standard user
    const resetResult = await User.updateMany({}, { $set: { role: 'user' } });
    console.log(`Downgraded ${resetResult.modifiedCount} users to standard role.`);

    // Then, make ONLY the owner an admin
    const adminEmail = 'jharitesh148@gmail.com';
    const upgradeResult = await User.findOneAndUpdate(
        { email: adminEmail }, 
        { $set: { role: 'admin' } },
        { new: true }
    );
    
    if (upgradeResult) {
        console.log(`Successfully elevated ${adminEmail} to admin role.`);
    } else {
        console.log(`User ${adminEmail} not found!`);
    }

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
