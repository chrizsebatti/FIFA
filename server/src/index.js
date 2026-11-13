
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import adminRoutes from './routes/admin.js';
import membersRoutes from './routes/members.js';
import groundRentRoutes from './routes/groundRent.js';
import financeRoutes from './routes/finance.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT) || 5001;

// --------------------------------------------------
// CORS CONFIGURATION
// --------------------------------------------------

const allowedOrigins = [
  'http://localhost:5173',
  'https://soccer-edathirinji.vercel.app',

  ...String(process.env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean),
];

// Remove duplicate origins
const uniqueAllowedOrigins = [...new Set(allowedOrigins)];

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests without an Origin header
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = uniqueAllowedOrigins.includes(
      origin.replace(/\/$/, '')
    );

    if (!isAllowed) {
      console.error('CORS blocked origin:', origin);
      console.log('Allowed origins:', uniqueAllowedOrigins);

      return callback(null, false);
    }

    return callback(null, true);
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],

  optionsSuccessStatus: 204,
};

// Register CORS before API routes
app.use(cors(corsOptions));

// Handle JSON request bodies
app.use(express.json());

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.use('/api/admin', adminRoutes);
app.use('/api/admin/members', membersRoutes);
app.use('/api/admin/ground-rent', groundRentRoutes);
app.use('/api/admin/finance', financeRoutes);

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
  });
});

// --------------------------------------------------
// API 404 HANDLER
// --------------------------------------------------

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: 'Not found',
    });
  }

  next();
});

// --------------------------------------------------
// SERVE FRONTEND IN PRODUCTION
// --------------------------------------------------

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');

  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));

    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

// --------------------------------------------------
// GLOBAL ERROR HANDLER
// --------------------------------------------------

app.use(errorHandler);

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);

  console.log('Allowed CORS origins:');
  uniqueAllowedOrigins.forEach((origin) => {
    console.log(` - ${origin}`);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Change PORT in server/.env (macOS often uses 5000 for AirPlay).`
    );

    process.exit(1);
  }

  throw err;
});

// --------------------------------------------------
// DATABASE CONNECTION
// --------------------------------------------------

connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
