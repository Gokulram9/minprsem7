import api from './axios';

export const judgeApi = {
  // Stats & Dashboard
  getJudgeStats: async () => {
    const res = await api.get('/judge/stats');
    return res.data;
  },

  // Cases
  getJudgeCases: async (params = {}) => {
    const res = await api.get('/judge/cases', { params });
    return res.data;
  },

  getJudgeCaseById: async (id) => {
    const res = await api.get(`/judge/cases/${id}`);
    return res.data;
  },

  // Hearings & Calendar
  getJudgeHearings: async (params = {}) => {
    const res = await api.get('/judge/hearings', { params });
    return res.data;
  },

  scheduleHearing: async (payload) => {
    const res = await api.post('/judge/hearings', payload);
    return res.data;
  },

  rescheduleHearing: async (id, payload) => {
    const res = await api.patch(`/judge/hearings/${id}/reschedule`, payload);
    return res.data;
  },

  adjournHearing: async (id, payload) => {
    const res = await api.patch(`/judge/hearings/${id}/adjourn`, payload);
    return res.data;
  },

  cancelHearing: async (id, payload) => {
    const res = await api.patch(`/judge/hearings/${id}/cancel`, payload);
    return res.data;
  },

  submitHearingReport: async (id, payload) => {
    const res = await api.post(`/judge/hearings/${id}/report`, payload);
    return res.data;
  },

  // Investigation Workflow
  requestInvestigation: async (id, payload) => {
    const res = await api.post(`/judge/cases/${id}/investigation`, payload);
    return res.data;
  },

  reviewInvestigation: async (id, payload) => {
    const res = await api.patch(`/judge/cases/${id}/investigation/review`, payload);
    return res.data;
  },

  // Case Transfer Workflow
  requestCaseTransfer: async (id, payload) => {
    const res = await api.post(`/judge/cases/${id}/transfer`, payload);
    return res.data;
  },

  // Judgment & Closure
  recordJudgment: async (id, payload) => {
    const res = await api.post(`/judge/cases/${id}/judgment`, payload);
    return res.data;
  },

  // Confidential Judicial Notes
  addConfidentialNote: async (id, note) => {
    const res = await api.post(`/judge/cases/${id}/confidential-notes`, { note });
    return res.data;
  },

  // Profile
  getJudgeProfile: async () => {
    const res = await api.get('/judge/profile');
    return res.data;
  },

  updateJudgeProfile: async (data) => {
    const res = await api.post('/judge/profile', data);
    return res.data;
  },
};

export default judgeApi;
