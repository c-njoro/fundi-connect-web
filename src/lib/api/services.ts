// src/lib/api/services.ts
import apiClient from './client';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/users/login', { email, password });
    return response.data;
  },
  
  register: async (data: any) => {
    const response = await apiClient.post('/users/register', data);
    return response.data;
  },
};

export const jobService = {
  createJob: async (data: any) => {
    const response = await apiClient.post('/jobs', data);
    return response.data;
  },
  
  getMyJobs: async (role?: string, status?: string) => {
    const response = await apiClient.get('/jobs/my-jobs', {
      params: { role, status },
    });
    return response.data;
  },
  
  getJobById: async (id: string) => {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data;
  },
  
  getAllJobs: async (params?: any) => {
    const response = await apiClient.get('/jobs', { params });
    return response.data;
  },
  
  submitProposal: async (jobId: string, data: any) => {
    const response = await apiClient.post(`/jobs/${jobId}/proposals`, data);
    return response.data;
  },
  
  acceptProposal: async (jobId: string, proposalIndex: number) => {
    const response = await apiClient.patch(`/jobs/${jobId}/proposals/${proposalIndex}/accept`);
    return response.data;
  },
};

export const userService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },
  
  becomeFundi: async (data: any) => {
    const response = await apiClient.post('/users/become-fundi', data);
    return response.data;
  },
  
  searchFundis: async (params: any) => {
    const response = await apiClient.get('/users/fundis', { params });
    return response.data;
  },
};

export const messageService = {
  sendMessage: async (data: any) => {
    const response = await apiClient.post('/messages', data);
    return response.data;
  },
  
  getJobMessages: async (jobId: string) => {
    const response = await apiClient.get(`/messages/job/${jobId}`);
    return response.data;
  },
  
  getConversations: async () => {
    const response = await apiClient.get('/messages/conversations');
    return response.data;
  },
};

export const notificationService = {
  getNotifications: async (params?: any) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },
  
  markAsRead: async (id: string) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },
  
  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },
};

export const reviewService = {
  createReview: async (data: any) => {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },
  
  getUserReviews: async (userId: string, params?: any) => {
    const response = await apiClient.get(`/reviews/user/${userId}`, { params });
    return response.data;
  },
  
  addResponse: async (reviewId: string, response: string) => {
    const res = await apiClient.patch(`/reviews/${reviewId}/response`, { response });
    return res.data;
  },
};

export const serviceService = {
  getAllServices: async (params?: any) => {
    const response = await apiClient.get('/services', { params });
    return response.data;
  },
  
  getServiceById: async (id: string) => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await apiClient.get('/services/categories');
    return response.data;
  },
};