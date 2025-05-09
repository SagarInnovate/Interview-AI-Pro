import axios from 'axios';

// Create axios instance with base URL and credentials
// Ensure axios is configured to send credentials
const apiClient = axios.create({
  baseURL: '/api', // Use relative path in production
  withCredentials: true, // MUST be true
  headers: {
    'Content-Type': 'application/json'
  }
});

// Session Services
export const sessionService = {
  createSession: (name) => apiClient.post('/session/start-new', { name }),
  continueSession: (uniqueId) => apiClient.post('/session/continue', { uniqueId }),
  getProfile: () => apiClient.get('/session/profile'),
  updateProfile: (data) => apiClient.post('/session/update-profile', data),
  endSession: () => apiClient.get('/session/end')
};

// Space Services
export const spaceService = {
  getSpaces: () => apiClient.get('/spaces'),
  getSpaceDetails: (id) => apiClient.get(`/spaces/${id}`),
  createSpace: (formData) => {
    // Special config for file uploads
    return apiClient.post('/spaces/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  downloadResume: (id) => apiClient.get(`/spaces/resume/${id}`, { responseType: 'blob' })
};

// Interview Services
export const interviewService = {
  generateQuestions: (spaceId, roundName) => 
    apiClient.get(`/interview/${spaceId}/${roundName}/generate-questions`),
  finishRound: (spaceId, roundName, answers) => 
    apiClient.post(`/interview/${spaceId}/${roundName}/finish`, { answers }),
  getQuestionsAnswers: (roundId) => 
    apiClient.get(`/interview/questions-answers/${roundId}`)
};

export default {
  session: sessionService,
  spaces: spaceService,
  interview: interviewService
};