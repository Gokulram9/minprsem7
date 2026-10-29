const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from server/.env or root .env
const serverEnvPath = path.resolve(__dirname, '..', '.env');
const rootEnvPath = path.resolve(__dirname, '..', '..', '.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath, override: true });
}
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath, override: false });
}

const mongoose = require('mongoose');
const { sanitizeUri, sanitizeError } = require('../config/db');

async function testDatabaseConnection() {
  console.log('\n======================================================');
  console.log('🔍 Testing MongoDB Atlas Connection');
  console.log('======================================================\n');

  // Check where .env files are located
  console.log(`📁 Loaded configs from:`);
  console.log(`   - Root .env: ${fs.existsSync(rootEnvPath) ? 'Found' : 'Not found'}`);
  console.log(`   - Server .env (server/.env): ${fs.existsSync(serverEnvPath) ? 'Found' : 'Not found'}\n`);

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ ERROR: MONGODB_URI is not defined in your .env file.');
    if (process.env.MONGO_URI) {
      console.log(`ℹ️  Found legacy MONGO_URI (${sanitizeUri(process.env.MONGO_URI)}), but MONGODB_URI is required for Atlas.`);
    }
    console.log('\n👉 ACTION REQUIRED:');
    console.log('   Add your MongoDB Atlas connection string to either .env or server/.env:');
    console.log('   MONGODB_URI=mongodb+srv://<username>:<password>@courtcluster.hlaocvi.mongodb.net/court_case_db?retryWrites=true&w=majority\n');
    process.exit(1);
  }

  const safeUri = sanitizeUri(uri);
  console.log(`📡 Target URI: ${safeUri}`);
  console.log('🎯 Target Database: court_case_db');
  console.log('⏳ Attempting connection (timeout: 10s)...');

  const startTime = Date.now();

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'court_case_db',
      serverSelectionTimeoutMS: 10000,
    });

    const elapsed = Date.now() - startTime;
    console.log('\n------------------------------------------------------');
    console.log('🎉 SUCCESS: Connected to MongoDB Atlas successfully!');
    console.log(`⏱️  Latency: ${elapsed}ms`);
    console.log(`🌐 Cluster Host: ${conn.connection.host}`);
    console.log(`📂 Active Database: ${conn.connection.name}`);

    // List collections to verify read permissions
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📊 Existing Collections (${collections.length}):`, collections.map(c => c.name).join(', ') || '(empty database - initial auto-seed will run on first server start)');
    console.log('------------------------------------------------------\n');

    await mongoose.disconnect();
    console.log('🔌 Connection closed cleanly. Database test passed.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n------------------------------------------------------');
    console.error('❌ FAILED: Unable to connect to MongoDB Atlas.');
    console.error('Detailed Error (Sanitized):', sanitizeError(error));
    console.error('------------------------------------------------------\n');
    console.log('💡 Troubleshooting Tips:');
    console.log(' 1. Verify your username and password in .env (replace <username> and <password> without angle brackets).');
    console.log(' 2. Check MongoDB Atlas -> Network Access: ensure your current IP address (or 0.0.0.0/0) is whitelisted.');
    console.log(' 3. Check MongoDB Atlas -> Database Access: ensure the user has read/write privileges on "court_case_db".');
    console.log(' 4. If your password contains special characters like @, #, %, ensure they are URL-encoded.\n');
    process.exit(1);
  }
}

testDatabaseConnection();
