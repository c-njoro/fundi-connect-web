// src/lib/api/services.ts
import apiClient from './client';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/users/login', { email, password });
      return response.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Login failed';
      const errors = err?.response?.data?.errors;
      return { success: false, message, errors };
    }
  },
  
  register: async (data: any) => {
    try {
      const response = await apiClient.post('/users/register', data);
      return response.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Registration failed';
      const errors = err?.response?.data?.errors;
      return { success: false, message, errors };
    }
  },
};

export const jobService = {
  createJob: async (data: any) => {
    try {
      const response = await apiClient.post('/jobs', data);
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Create job failed', errors: err?.response?.data?.errors };
    }
  },

  getMyJobs: async (role?: string, status?: string) => {
    try {
      const response = await apiClient.get('/jobs/my-jobs', {
        params: { role, status },
      });
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Get my jobs failed', errors: err?.response?.data?.errors };
    }
  },

  getJobById: async (id: string) => {
    try {
      const response = await apiClient.get(`/jobs/${id}`);
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Get job failed', errors: err?.response?.data?.errors };
    }
  },

  getAllJobs: async (params?: any) => {
    try {
      const response = await apiClient.get('/jobs', { params });
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Get jobs failed', errors: err?.response?.data?.errors };
    }
  },

  submitProposal: async (jobId: string, data: any) => {
    try {
      const response = await apiClient.post(`/jobs/${jobId}/proposals`, data);
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Submit proposal failed', errors: err?.response?.data?.errors };
    }
  },

  acceptProposal: async (jobId: string, proposalIndex: number) => {
    try {
      const response = await apiClient.patch(`/jobs/${jobId}/proposals/${proposalIndex}/accept`);
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Accept proposal failed', errors: err?.response?.data?.errors };
    }
  },
};

export const userService = {
  getProfile: async () => {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Get profile failed', errors: err?.response?.data?.errors };
    }
  },

  updateProfile: async (data: any) => {
    try {
      const response = await apiClient.put('/users/profile', data);
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Update profile failed', errors: err?.response?.data?.errors };
    }
  },

  becomeFundi: async (data: any) => {
    try {
      const response = await apiClient.post('/users/become-fundi', data);
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Become fundi failed', errors: err?.response?.data?.errors };
    }
  },

  searchFundis: async (params: any) => {
    try {
      const response = await apiClient.get('/users/fundis', { params });
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Search fundis failed', errors: err?.response?.data?.errors };
    }
  },
};

export const messageService = {
  sendMessage: async (data: any) => {
    try {
      const response = await apiClient.post('/messages', data);
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Send message failed', errors: err?.response?.data?.errors };
    }
  },

  getJobMessages: async (jobId: string) => {
    try {
      const response = await apiClient.get(`/messages/job/${jobId}`);
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Get job messages failed', errors: err?.response?.data?.errors };
    }
  },

  getConversations: async () => {
    try {
      const response = await apiClient.get('/messages/conversations');
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Get conversations failed', errors: err?.response?.data?.errors };
    }
  },
};

export const notificationService = {
  getNotifications: async (params?: any) => {
    try {
      const response = await apiClient.get('/notifications', { params });
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Get notifications failed', errors: err?.response?.data?.errors };
    }
  },

  markAsRead: async (id: string) => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Mark as read failed', errors: err?.response?.data?.errors };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await apiClient.patch('/notifications/read-all');
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Mark all as read failed', errors: err?.response?.data?.errors };
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Get unread count failed', errors: err?.response?.data?.errors };
    }
  },
};

export const reviewService = {
  createReview: async (data: any) => {
    try {
      const response = await apiClient.post('/reviews', data);
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Create review failed', errors: err?.response?.data?.errors };
    }
  },

  getUserReviews: async (userId: string, params?: any) => {
    try {
      const response = await apiClient.get(`/reviews/user/${userId}`, { params });
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Get user reviews failed', errors: err?.response?.data?.errors };
    }
  },

  addResponse: async (reviewId: string, response: string) => {
    try {
      const res = await apiClient.patch(`/reviews/${reviewId}/response`, { response });
      return res.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Add response failed', errors: err?.response?.data?.errors };
    }
  },
};

export const serviceService = {
  getAllServices: async (params?: any) => {
    try {
      const response = await apiClient.get('/services', { params });
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Get services failed', errors: err?.response?.data?.errors };
    }
  },

  getServiceById: async (id: string) => {
    try {
      const response = await apiClient.get(`/services/${id}`);
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Get service failed', errors: err?.response?.data?.errors };
    }
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get('/services/categories');
      return response.data;
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Get categories failed', errors: err?.response?.data?.errors };
    }
  },
};