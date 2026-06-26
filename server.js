const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const db = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const publikasiRoutes = require('./routes/publikasiRoutes');
const galeriRoutes = require('./routes/galeriRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (css, js, images) from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Friendly URL Routing for Frontend Views
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/profil', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profil.html'));
});

app.get('/publikasi', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'publikasi.html'));
});

app.get('/publikasi/detail/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detail-publikasi.html'));
});

app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

// Friendly URL Routing for Admin Dashboard
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

// Test database connection at startup
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Successfully connected to the MySQL database (db_hiqma).');
    connection.release();
  } catch (error) {
    console.error('Critical Error: Could not connect to the database.');
    console.error(error.message);
  }
})();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/publikasi', publikasiRoutes);
app.use('/api/galeri', galeriRoutes);

// Base API Route
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to the official UKM HIQMA UIN Jakarta API Portal',
    version: '1.0.0'
  });
});

// Centralized error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong on the server!'
  });
});

// Run server
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
