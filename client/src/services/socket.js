import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (user) => {
  if (!socket) {
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to server:', socket.id);
      if (user && user._id) {
        socket.emit('joinRoom', `user_${user._id}`);
      }
    });
  } else if (user && user._id) {
    socket.emit('joinRoom', `user_${user._id}`);
  }

  return socket;
};

export const getSocket = () => socket;

export const subscribeToMessages = (callback) => {
  if (socket) {
    socket.on('newMessage', (message) => {
      callback(message);
    });
  }
};

export const subscribeToNotifications = (callback) => {
  if (socket) {
    socket.on('notification', (notif) => {
      callback(notif);
    });
  }
};
