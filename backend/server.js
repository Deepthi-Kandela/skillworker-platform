const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ── Socket.io ──
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('joinRoom', (bookingId) => socket.join(bookingId));
  socket.on('leaveRoom', (bookingId) => socket.leave(bookingId));
  socket.on('sendMessage', (data) => io.to(data.bookingId).emit('newMessage', data));
  socket.on('disconnect', () => {});
});

// ── Rate Limiting ──
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── CORS ──
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    /\.onrender\.com$/,
    /\.vercel\.app$/,
    /\.netlify\.app$/,
  ],
  credentials: true,
}));

app.use(express.json());

// ── API Routes ──
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/workers',       require('./routes/workers'));
app.use('/api/bookings',      require('./routes/bookings'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/payments',      require('./routes/payments'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/voice',         require('./routes/voice'));
app.use('/api/chat',          require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/wallet',        require('./routes/wallet'));
app.use('/api/complaints',    require('./routes/complaints'));
app.use('/api/subscriptions', require('./routes/subscriptions'));

// ── Test Route ──
app.get('/api', (req, res) => res.json({ message: 'SkillWorker API Running ⚡' }));

// ── Serve React Frontend ──
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// ── Error Handler ──
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server + Socket.io running on port ${PORT}`));
