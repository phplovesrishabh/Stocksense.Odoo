const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB Atlas.
 * Called once at server startup; subsequent calls are no-ops.
 */
async function connectMongo() {
  if (isConnected) return;

  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable.');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅  MongoDB connected');
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { connectMongo };
