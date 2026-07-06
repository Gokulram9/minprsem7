const lawyers = [
  { id: 'LAW-101', name: 'Ava Deshmukh', expertise: ['Family', 'Civil'], experience: 12, availability: 'High', location: 'Colombo' },
  { id: 'LAW-102', name: 'Dilan Fernando', expertise: ['Criminal', 'Employment'], experience: 9, availability: 'Medium', location: 'Galle' },
  { id: 'LAW-103', name: 'Niranjani Perera', expertise: ['Property', 'Family'], experience: 14, availability: 'High', location: 'Kandy' },
  { id: 'LAW-104', name: 'Sameer Kottegoda', expertise: ['Civil', 'Property'], experience: 11, availability: 'Low', location: 'Negombo' },
];

let cases = [
  {
    id: 'CASE-1001',
    applicantName: 'Nimal Perera',
    email: 'nimal@example.com',
    caseType: 'Family',
    urgency: 'High',
    description: 'Custody and guardianship dispute',
    status: 'Submitted',
    assignedLawyerId: null,
    hearingDate: null,
    notes: 'Awaiting legal review',
    createdAt: '2026-06-20',
  },
  {
    id: 'CASE-1002',
    applicantName: 'Sajini Silva',
    email: 'sajini@example.com',
    caseType: 'Property',
    urgency: 'Medium',
    description: 'Land possession documentation',
    status: 'Scheduled',
    assignedLawyerId: 'LAW-103',
    hearingDate: '2026-07-03',
    notes: 'Scheduled for mediation',
    createdAt: '2026-06-24',
  },
];

function getAllCases() {
  return cases;
}

function createCase(payload) {
  const newCase = {
    id: `CASE-${Date.now()}`,
    applicantName: payload.applicantName || 'Anonymous',
    email: payload.email || 'unknown@example.com',
    caseType: payload.caseType || 'General',
    urgency: payload.urgency || 'Medium',
    description: payload.description || 'No summary provided',
    status: 'Submitted',
    assignedLawyerId: null,
    hearingDate: null,
    notes: 'Application received and pending review',
    createdAt: new Date().toISOString().slice(0, 10),
  };
  cases = [newCase, ...cases];
  return newCase;
}

function updateCaseStatus(id, status, notes) {
  cases = cases.map((item) => {
    if (item.id !== id) {
      return item;
    }
    return {
      ...item,
      status,
      notes: notes || item.notes,
    };
  });

  return cases.find((item) => item.id === id);
}

module.exports = {
  lawyers,
  getAllCases,
  createCase,
  updateCaseStatus,
};
