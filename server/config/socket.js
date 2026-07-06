const { Server } = require('socket.io');

let io;

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5175',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('joinRoom', (room) => {
      socket.join(room);
    });

    socket.on('caseUpdate', (payload) => {
      io.to(payload.room).emit('caseUpdate', payload);
    });

    socket.on('message', (payload) => {
      io.to(payload.room).emit('message', payload);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

const getSocket = () => io;

module.exports = { initializeSocket, getSocket };
