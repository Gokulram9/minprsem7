import api from './axios';

export const lawyerApi = {
  // Assigned Cases
  getAssignedCases: async () => {
    const res = await api.get('/applications/assigned');
    return res.data;
  },

  acceptCase: async (caseId) => {
    const res = await api.patch(`/applications/${caseId}/accept`);
    return res.data;
  },

  declineCase: async (caseId) => {
    const res = await api.patch(`/applications/${caseId}/decline`);
    return res.data;
  },

  updateCaseStatus: async (caseId, status, note) => {
    const res = await api.patch(`/applications/${caseId}/case-status`, { status, note });
    return res.data;
  },

  // Case Notes
  getCaseNotes: async (caseId) => {
    const res = await api.get(`/applications/${caseId}/notes`);
    return res.data;
  },

  addCaseNote: async (caseId, text) => {
    const res = await api.post(`/applications/${caseId}/notes`, { text });
    return res.data;
  },

  // Lawyer Stats & Profile
  getLawyerStats: async () => {
    const res = await api.get('/lawyers/me/stats');
    return res.data;
  },

  getMyProfile: async () => {
    const res = await api.get('/lawyers/me/profile');
    return res.data;
  },

  updateMyProfile: async (profileData) => {
    const res = await api.post('/lawyers/profile', profileData);
    return res.data;
  },

  updateAvailability: async (availabilityStatus) => {
    const res = await api.put('/lawyers/availability', { availabilityStatus });
    return res.data;
  },

  updateFees: async (feesData) => {
    const res = await api.put('/lawyers/fees', feesData);
    return res.data;
  },

  // Messages & Communication
  getConversations: async () => {
    const res = await api.get('/messages/conversations');
    return res.data;
  },

  getConversationMessages: async (userId) => {
    const res = await api.get(`/messages/conversation/${userId}`);
    return res.data;
  },

  sendMessage: async ({ receiver, text, application }) => {
    const res = await api.post('/messages', { receiver, text, application });
    return res.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },

  markNotificationsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  // Hearings & Schedule
  getHearings: async () => {
    const res = await api.get('/hearings');
    return res.data;
  },

  // Documents
  getDocuments: async () => {
    const res = await api.get('/documents');
    return res.data;
  },

  uploadDocument: async (formData) => {
    const res = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export default lawyerApi;
