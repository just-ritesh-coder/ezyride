// backend/server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');


dotenv.config();

// Models
const Chat = require('./models/Chat');
const Ride = require('./models/Ride');

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const rideStatusRoutes = require('./routes/rideStatus');
const meRoutes = require('./routes/me');
const usersRoutes = require('./routes/users');
const ridesRoutes = require('./routes/rides');
const bookingsRoutes = require('./routes/bookings');
const profileRoutes = require('./routes/profile');
const chatsRoutes = require('./routes/chats'); // NEW: REST history/fallback
const sosRoutes = require("./routes/sos"); // NEW: SOS

const app = express();

// CORS
const allowOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowOrigin, credentials: true }));

app.use(express.json());

// Mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Base route
app.get('/', (req, res) => res.send('Ride Sharing API is running 🚀'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/rides', rideStatusRoutes);
app.use('/api', meRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/chats', chatsRoutes); // NEW
app.use("/api/sos", sosRoutes); // NEW
// Optional: serve SPA in production (adjust path to your frontend build)
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientBuild));
  app.get('*', (_req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
}

// HTTP server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowOrigin, credentials: true } });

// Socket auth
io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.split(' ')[1];
  if (!token) return next(new Error('Unauthorized'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

// Helper: only driver or booked passenger can join ride chat
const canJoinRideRoom = async (rideId, userId) => {
  try {
    const ride = await Ride.findById(rideId).select('postedBy');
    if (!ride) return false;
    if (ride.postedBy?.toString() === userId) return true;
    const Booking = require('./models/Booking');
    const hasBooking = await Booking.exists({ ride: rideId, user: userId });
    return !!hasBooking;
  } catch {
    return false;
  }
};

// Sockets
io.on('connection', (socket) => {
  console.log('🔌 Connected:', socket.userId);

  socket.on('chat:join', async ({ rideId }) => {
    if (!rideId) return;
    if (!(await canJoinRideRoom(rideId, socket.userId))) return;
    socket.join(rideId);
    console.log(`👥 user ${socket.userId} joined ride ${rideId}`);
  });

  socket.on('chat:message', async ({ rideId, text }) => {
    if (!text?.trim() || !rideId) return;
    if (!(await canJoinRideRoom(rideId, socket.userId))) return;

    const chat = await Chat.create({
      ride: rideId,
      sender: socket.userId,
      message: text.trim(),
    });

    const populated = await Chat.findById(chat._id).populate('sender', 'fullName email');
    io.to(rideId).emit('chat:message', { chat: populated });
  });

  socket.on('chat:typing', async ({ rideId, typing }) => {
    if (!rideId) return;
    if (!(await canJoinRideRoom(rideId, socket.userId))) return;
    socket.to(rideId).emit('chat:typing', { userId: socket.userId, typing: !!typing });
  });
});

// Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
