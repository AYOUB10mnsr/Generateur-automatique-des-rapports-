import axios from 'axios';

/**
 * API Service - Handles all backend API calls
 * Currently set up with mock responses
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Augmenté à 2 minutes pour gérer les transcriptions longues
});


// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Process a YouTube video and generate report
 */
export const processYouTubeVideo = async (url) => {
  const formData = new FormData();
  formData.append('url', url);
  return apiClient.post('/generate', formData);
};

export const processLocalMediaFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/generate', formData);
};

export const processTextNotes = async (text) => {
  const formData = new FormData();
  formData.append('text', text);
  return apiClient.post('/generate', formData);
};

export const downloadReportDocx = async ({ url, text, file }) => {
  const formData = new FormData();
  if (url) {
    formData.append('url', url);
  }
  if (text) {
    formData.append('text', text);
  }
  if (file) {
    formData.append('file', file);
  }
  return apiClient.post('/generate/download', formData, {
    responseType: 'blob',
  });
};

/**
 * Get processing progress
 */
export const getProcessingProgress = async (reportId) => {
  // Mock response
  return new Promise((resolve) => {
    const progress = Math.min(Math.random() * 100, 95);
    resolve({
      reportId,
      progress: Math.round(progress),
      currentStep: progress < 33 ? 0 : progress < 66 ? 1 : 2,
      steps: ['Downloading', 'Transcribing', 'Generating'],
    });
  });

  // Actual API call:
  // return apiClient.get(`/videos/${reportId}/progress`);
};

/**
 * Get final report
 */
export const getReport = async (reportId) => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: reportId,
        title: 'AI Meeting Report - Sample',
        timestamp: new Date().toISOString(),
        url: 'https://youtube.com/watch?v=example',
        summary: {
          duration: '45 minutes',
          mainTopic: 'Product Strategy & Features',
          keyTakeaway: 'Focus on user experience improvements and market expansion',
        },
        participants: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams'],
        decisions: [
          {
            id: 1,
            title: 'Implement new dashboard UI',
            owner: 'John Doe',
            priority: 'high',
            deadline: '2024-05-15',
          },
          {
            id: 2,
            title: 'Conduct market research',
            owner: 'Jane Smith',
            priority: 'medium',
            deadline: '2024-05-20',
          },
          {
            id: 3,
            title: 'Schedule follow-up meeting',
            owner: 'Mike Johnson',
            priority: 'low',
            deadline: '2024-05-10',
          },
        ],
        tasks: [
          {
            id: 1,
            title: 'Update API documentation',
            assigned: 'Sarah Williams',
            status: 'in-progress',
            deadline: '2024-05-08',
          },
          {
            id: 2,
            title: 'Review performance metrics',
            assigned: 'John Doe',
            status: 'pending',
            deadline: '2024-05-12',
          },
          {
            id: 3,
            title: 'Design new features',
            assigned: 'Jane Smith',
            status: 'pending',
            deadline: '2024-05-18',
          },
        ],
        actionItems: [
          'Prioritize dashboard redesign in next sprint',
          'Schedule meeting with design team',
          'Get stakeholder approval for budget allocation',
        ],
        transcript: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
      });
    }, 800);
  });

  // Actual API call:
  // return apiClient.get(`/videos/${reportId}`);
};

/**
 * Get all previous reports
 */
export const getReports = async () => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'report-1',
          title: 'Q1 Planning Meeting',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          duration: '60 minutes',
          participants: 5,
        },
        {
          id: 'report-2',
          title: 'Product Launch Discussion',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration: '45 minutes',
          participants: 4,
        },
        {
          id: 'report-3',
          title: 'Team Standup - Sprint 15',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          duration: '30 minutes',
          participants: 8,
        },
      ]);
    }, 500);
  });

  // Actual API call:
  // return apiClient.get('/videos');
};

/**
 * Delete a report
 */
export const deleteReport = async (reportId) => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Report deleted' });
    }, 300);
  });

  // Actual API call:
  // return apiClient.delete(`/videos/${reportId}`);
};

/**
 * Export report as PDF
 */
export const exportReportAsPDF = async (reportId) => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        filename: `report-${reportId}.pdf`,
        url: '/mock-pdf-url',
      });
    }, 1000);
  });

  // Actual API call:
  // return apiClient.post(`/videos/${reportId}/export-pdf`, {}, {
  //   responseType: 'blob'
  // });
};

export default apiClient;
