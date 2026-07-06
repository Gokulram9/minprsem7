const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const net = require('net');

let mongod = null;

const checkMongoRunning = (port = 27017, host = '127.0.0.1') => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
};

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/legal-aid-portal';
    
    // Parse host and port from mongoUri if possible
    let host = '127.0.0.1';
    let port = 27017;
    const match = mongoUri.match(/mongodb:\/\/(.*?):(\d+)/);
    if (match) {
      host = match[1];
      port = parseInt(match[2], 10);
    }

    const isLocalMongoRunning = await checkMongoRunning(port, host);

    if (!isLocalMongoRunning) {
      console.log('Local MongoDB not running on ' + host + ':' + port + '. Starting in-memory MongoDB server...');
      mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      process.env.MONGO_URI = mongoUri;
      console.log(`In-memory MongoDB server started at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};


module.exports = connectDB;

