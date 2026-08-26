import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import db, { initDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import favoriteRoutes from './routes/favorites.js';
import inquiryRoutes from './routes/inquiries.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import { seedDatabase } from './seed/seedData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure uploads folder exists and serve statically
const isServerless = process.env.VERCEL === '1' || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME;
const uploadDir = isServerless ? '/tmp/uploads' : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {
    // Ignore error
  }
}
app.use('/uploads', express.static(uploadDir));

// Initialize SQLite schema
initDatabase();

// Auto-seed if database is empty
try {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
  if (userCount === 0) {
    console.log('Database empty, automatically seeding initial data...');
    seedDatabase();
  }
} catch (e) {
  console.error('Auto-seed check error:', e);
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RentHub API Server is running smoothly.',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

export default app;
