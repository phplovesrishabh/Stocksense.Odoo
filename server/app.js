require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const { connectMongo }  = require('./config/mongodb');
const { errorHandler }  = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/auth');
// Future routes — uncomment as each phase is built:
// const warehouseRoutes  = require('./routes/warehouses');
// const productRoutes    = require('./routes/products');
// const receiptRoutes    = require('./routes/receipts');
// const deliveryRoutes   = require('./routes/deliveries');
// const adjustmentRoutes = require('./routes/adjustments');
// const ledgerRoutes     = require('./routes/ledger');
// const dashboardRoutes  = require('./routes/dashboard');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Security headers ────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, mobile apps in dev)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ─── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request logging ─────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/warehouses',  warehouseRoutes);
// app.use('/api/v1/products',    productRoutes);
// app.use('/api/v1/receipts',    receiptRoutes);
// app.use('/api/v1/deliveries',  deliveryRoutes);
// app.use('/api/v1/adjustments', adjustmentRoutes);
// app.use('/api/v1/ledger',      ledgerRoutes);
// app.use('/api/v1/dashboard',   dashboardRoutes);

// ─── 404 handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// ─── Global error handler (must be last) ─────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────
async function startServer() {
  await connectMongo();

  app.listen(PORT, () => {
    console.log(`🚀  StockSense API running on http://localhost:${PORT}`);
    console.log(`    Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app; // for testing
