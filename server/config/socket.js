const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Socket middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        (socket.handshake.headers?.authorization && socket.handshake.headers.authorization.split(' ')[1]);

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id).select('_id name email role');
          if (user) {
            socket.user = user;
          }
        } catch (err) {
          console.warn('Socket token verification failed:', err.message);
        }
      }
      return next();
    } catch (err) {
      return next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    if (user) {
      const userRoom = `user_${user._id}`;
      socket.join(userRoom);
      socket.join(`role_${user.role}`);
      console.log(`⚡ Authenticated socket connection: ${user.name} (${user.role}) [${socket.id}] joined ${userRoom}`);
    } else {
      console.log(`⚡ Anonymous socket connected: ${socket.id}`);
    }

    // Explicit room join
    socket.on('joinRoom', (room) => {
      if (room) {
        socket.join(room);
      }
    });

    // Explicit manual authentication from client
    socket.on('authenticate', async (token) => {
      try {
        if (!token) return;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const u = await User.findById(decoded.id).select('_id name email role');
        if (u) {
          socket.user = u;
          socket.join(`user_${u._id}`);
          socket.join(`role_${u.role}`);
          console.log(`⚡ Socket re-authenticated: ${u.name} (${u.role})`);
        }
      } catch (err) {
        console.warn('Manual socket auth error:', err.message);
      }
    });

    // Join conversation room
    socket.on('joinConversation', (conversationId) => {
      if (conversationId) {
        socket.join(`conversation_${conversationId}`);
      }
    });

    // Leave conversation room
    socket.on('leaveConversation', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation_${conversationId}`);
      }
    });

    // Join case room
    socket.on('joinCase', (caseId) => {
      if (caseId) {
        socket.join(`case_${caseId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

const getSocket = () => io;

const sendToUser = (userId, event, payload) => {
  if (io && userId) {
    const room = `user_${userId.toString()}`;
    io.to(room).emit(event, payload);
  }
};

const sendToRole = (role, event, payload) => {
  if (io && role) {
    io.to(`role_${role}`).emit(event, payload);
  }
};

const sendToConversation = (conversationId, event, payload) => {
  if (io && conversationId) {
    io.to(`conversation_${conversationId.toString()}`).emit(event, payload);
  }
};

const sendToCase = (caseId, event, payload) => {
  if (io && caseId) {
    io.to(`case_${caseId.toString()}`).emit(event, payload);
  }
};

const broadcast = (event, payload) => {
  if (io) {
    io.emit(event, payload);
  }
};

module.exports = {
  initializeSocket,
  getSocket,
  sendToUser,
  sendToRole,
  sendToConversation,
  sendToCase,
  broadcast,
};
