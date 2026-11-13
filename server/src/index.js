
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
// REQUEST LOGGER
// --------------------------------------------------

app.use((req, res, next) => {
  console.log({
    method: req.method,
    url: req.originalUrl,
    origin: req.headers.origin,
  });

  next();
});

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

const uniqueAllowedOrigins = [...new Set(allowedOrigins)];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = uniqueAllowedOrigins.includes(
      origin.replace(/\/$/, '')
    );

    console.log('CORS Origin:', origin);
    console.log('CORS Allowed:', isAllowed);

    if (!isAllowed) {
      console.error('Blocked Origin:', origin);
    }

    return callback(null, isAllowed);
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

// Register CORS before all routes
app.use(cors(corsOptions));

app.get('/test', (req, res) => {
  res.json({ message: 'Backend routing works' });
});

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    application: 'soccer-edathirinji-server',
    version: '1.0.0',
  });
});

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin/members', membersRoutes);
app.use('/api/admin/ground-rent', groundRentRoutes);
app.use('/api/admin/finance', financeRoutes);

// API 404 handler - keep this after API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
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
      `Port ${PORT} is already in use.`
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
