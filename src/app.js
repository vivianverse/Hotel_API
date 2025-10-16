require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { connectDB } = require('./config/db'); 

// Routers 
const roomsRouter = require('./routes/rooms');
const guestsRouter = require('./routes/guests');
const bookingsRouter = require('./routes/bookings');
const guestRoutes = require('./routes/guestRoutes');
// const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json()); 
app.use(morgan('dev')); 

app.use('/api', guestRoutes);
// app.use('/api/auth', authRoutes);

app.use(cors());

app.get('/health', (_req, res) => res.json({ ok: true }));

// API routes
app.use('/api/rooms', roomsRouter);
app.use('/api/guests', guestsRouter);
app.use('/api/bookings', bookingsRouter);

const PORT = process.env.PORT || 3000;

// ConnectDB function to establish a DB connection 
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📍 Health check: http://localhost:${PORT}/health`)
    console.log(`📍 API Rooms endpoint: http://localhost:${PORT}/api/rooms`)
    console.log(`📍 API Guests endpoint: http://localhost:${PORT}/api/guests`)
    console.log(`📍 API Booking endpoint: http://localhost:${PORT}/api/bookings`)
  })
  .catch((err) => {
    console.error('Failed to connect DB:', err);
    if (process.env.NODE_ENV === 'production') {
      console.error('Exiting because database is required in production.');
      process.exit(1);
    }

    console.warn('Continuing to run server in development without DB connection. Some routes may fail.');
    app.listen(PORT, () => console.log(`API running on port ${PORT} (no DB)`));
  });
