const express = require('express');
const path = require('path');
const session = require('cookie-session');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

// Import routes
const apiRoutes = require('./routes/api');

const app = express();

// CORS setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://interview-ai-pro.onrender.com' // Use your actual domain
    : 'http://localhost:3000',
  credentials: true
}));

// Configure rate limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
  skip: (req) => req.session && req.session.admin === true // Skip for admins
});

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'interviewAppSecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// API Routes
app.use('/api', apiRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Any route that doesn't match API routes should serve React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  
  // Handle rate limit errors
  if (err.statusCode === 429) {
    return res.status(429).json({
      success: false,
      message: 'You have exceeded the request limit. Please try again later.'
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds the maximum limit (10MB)'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again later.'
  });
});

module.exports = app;