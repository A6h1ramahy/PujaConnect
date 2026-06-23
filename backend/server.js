require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Routes
const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const panditRoutes       = require('./routes/panditRoutes');
const ritualRoutes       = require('./routes/ritualRoutes');
const bookingRoutes      = require('./routes/bookingRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const adminRoutes        = require('./routes/adminRoutes');

// Connect to MongoDB
connectDB().then(() => {
  const { startExpirationJob } = require('./controllers/bookingController');
  startExpirationJob();
});

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    if (!allowedOrigins.length) {
      return callback(new Error('CORS_ORIGIN or FRONTEND_ORIGIN must be set in production'));
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'PujaConnect API is running 🙏' }));

// API Routes
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/pandits',      panditRoutes);
app.use('/api/rituals',      ritualRoutes);
app.use('/api/bookings',     bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/admin',        adminRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 PujaConnect server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
