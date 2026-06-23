require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploaded photos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
