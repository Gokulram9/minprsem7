const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Ensure environment variables are loaded from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

let mongod = null;

/**
 * Strips password and sensitive credentials from MongoDB URIs for safe logging
 */
const sanitizeUri = (uri) => {
  if (!uri || typeof uri !== 'string') return '';
  return uri.replace(/\/\/(.*?):(.*?)@/, '//$1:****@');
};

/**
 * Strips password and sensitive credentials from error messages
 */
const sanitizeError = (err) => {
  if (!err) return '';
  const msg = err.message || String(err);
  return msg.replace(/\/\/(.*?):(.*?)@/g, '//$1:****@');
};

/**
 * Connect to MongoDB database
 * Defaults to court_case_db as requested
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (mongoUri) {
    try {
      const safeUri = sanitizeUri(mongoUri);
      console.log(`📡 Connecting to MongoDB Atlas (${safeUri})...`);

      const conn = await mongoose.connect(mongoUri, {
        dbName: 'court_case_db',
        serverSelectionTimeoutMS: 5000,
      });

      console.log(`✅ MongoDB connected successfully: ${conn.connection.host} (database: ${conn.connection.name})`);
      return conn;
    } catch (error) {
      console.warn('⚠️  MongoDB Atlas cluster unreachable (IP whitelist or network filter detected).');
      console.warn('   Atlas Error:', sanitizeError(error));
      console.warn('   👉 To connect directly to Atlas: Open MongoDB Atlas -> Network Access -> Add Current IP Address (or 0.0.0.0/0).');
      
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }

      console.log('🔄 Starting resilient local database instance to allow offline/local development & testing...');
    }
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const inMemoryUri = mongod.getUri();
    const conn = await mongoose.connect(inMemoryUri, {
      dbName: 'court_case_db'
    });
    console.log(`✅ Local MongoDB connected: ${conn.connection.host} (database: ${conn.connection.name})`);
    return conn;
  } catch (memErr) {
    console.error('❌ Failed to start local database fallback:', memErr.message);
    throw memErr;
  }
};

module.exports = connectDB;
module.exports.sanitizeUri = sanitizeUri;
module.exports.sanitizeError = sanitizeError;
