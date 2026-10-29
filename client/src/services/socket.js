import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (user) => {
  const token = localStorage.getItem('legalAidToken');
  let SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
  if (!SOCKET_URL) {
    if (import.meta.env.VITE_API_URL) {
      SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
    } else if (typeof window !== 'undefined') {
      SOCKET_URL = `${window.location.protocol}//${window.location.hostname}:5000`;
    } else {
      SOCKET_URL = 'http://localhost:5000';
    }
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to server:', socket.id);
      if (token) {
        socket.emit('authenticate', token);
      }
      if (user && user._id) {
        socket.emit('joinRoom', `user_${user._id}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ Socket disconnected:', reason);
    });
  } else {
    if (token) {
      socket.emit('authenticate', token);
    }
    if (user && user._id) {
      socket.emit('joinRoom', `user_${user._id}`);
    }
  }

  return socket;
};

export const getSocket = () => socket;

export const joinConversationRoom = (conversationId) => {
  if (socket && conversationId) {
    socket.emit('joinConversation', conversationId);
  }
};

export const leaveConversationRoom = (conversationId) => {
  if (socket && conversationId) {
    socket.emit('leaveConversation', conversationId);
  }
};

export const joinCaseRoom = (caseId) => {
  if (socket && caseId) {
    socket.emit('joinCase', caseId);
  }
};

export const subscribeToMessages = (callback) => {
  if (socket) {
    socket.off('newMessage');
    socket.on('newMessage', (message) => {
      callback(message);
    });
  }
};

export const subscribeToNotifications = (callback) => {
  if (socket) {
    socket.off('notification');
    socket.on('notification', (notif) => {
      callback(notif);
    });
  }
};

export const subscribeToCaseUpdates = (callback) => {
  if (socket) {
    socket.off('caseUpdate');
    socket.on('caseUpdate', (update) => {
      callback(update);
    });
    socket.off('applicationUpdate');
    socket.on('applicationUpdate', (update) => {
      callback(update);
    });
  }
};

export const subscribeToHearingUpdates = (callback) => {
  if (socket) {
    socket.off('hearingUpdate');
    socket.on('hearingUpdate', (update) => {
      callback(update);
    });
  }
};
