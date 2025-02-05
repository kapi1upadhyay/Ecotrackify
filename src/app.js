// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');


require('dotenv').config();


// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const carbonFootprintRoutes = require('./routes/carbonFootprint');
const sustainabilityGoalsRoutes = require('./routes/sustainabilityGoals');
const ecoFriendlyPracticesRoutes = require('./routes/ecoFriendlyPractices');



// Initialize express app
const app = express();

// Connect to MongoDB
connectDB().catch(err => console.error(err));

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/carbon-footprint', carbonFootprintRoutes);
app.use('/api/v1/sustainability-goals', sustainabilityGoalsRoutes);
app.use('/api/v1/eco-friendly-practices', ecoFriendlyPracticesRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server5
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



