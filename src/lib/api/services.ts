// src/lib/api/services.ts
import { create } from "domain";
import apiClient from "./client";
import { start } from "repl";

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/users/login", {
        email,
        password,
      });
      return response.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "Login failed";
      const errors = err?.response?.data?.errors;
      return { success: false, message, errors };
    }
  },

  register: async (data: any) => {
    try {
      const response = await apiClient.post("/users/register", data);
      return response.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "Registration failed";
      const errors = err?.response?.data?.errors;
      return { success: false, message, errors };
    }
  },
};

export const jobService = {
  createJob: async (data: any) => {
    try {
      const response = await apiClient.post("/jobs", data);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Create job failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getMyJobs: async (role?: string, status?: string) => {
    try {
      const response = await apiClient.get("/jobs/me/my-jobs", {
        params: { role, status },
      });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get my jobs failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getJobById: async (id: string) => {
    try {
      const response = await apiClient.get(`/jobs/${id}`);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get job failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getAllJobs: async (params?: any) => {
    try {
      const response = await apiClient.get("/jobs", { params });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get jobs failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  submitProposal: async (jobId: string, data: any) => {
    try {
      const response = await apiClient.post(
        `/jobs/${jobId}/submit-proposal`,
        data,
      );
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Submit proposal failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  acceptProposal: async (jobId: string, proposalIndex: number) => {
    try {
      const response = await apiClient.patch(
        `/jobs/${jobId}/proposals/${proposalIndex}/accept`,
      );
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Accept proposal failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  startJob: async (jobId: string) => {
    try {
      const response = await apiClient.patch(`/jobs/${jobId}/start`);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Start job failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  updateProgress: async (jobId: string, data: any) => {
    try {
      const response = await apiClient.post(`/jobs/${jobId}/progress`, data);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Update progress failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  completeJob: async (jobId: string, data: any) => {
    try {
      const response = await apiClient.patch(`/jobs/${jobId}/complete`, data);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Complete job failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  approveCompletion: async (jobId: string) => {
    try {
      const response = await apiClient.patch(`/jobs/${jobId}/approve`);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Approve completion failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getMyProposals: async () => {
    try {
      const response = await apiClient.get("/jobs/fundi/proposals");
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get my proposals failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getMyProposalStats: async () => {
    try {
      const response = await apiClient.get("/jobs/fundi/proposals/stats");
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get my proposal stats failed",
        errors: err?.response?.data?.errors,
      };
    }
  },
};

export const userService = {
  getProfile: async () => {
    try {
      const response = await apiClient.get("/users/profile");
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get profile failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  updateProfile: async (data: any) => {
    try {
      const response = await apiClient.put("/users/profile", data);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Update profile failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      const response = await apiClient.put("/users/change-password", {
        currentPassword: oldPassword,
        newPassword,
      });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Change password failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  updateFundiProfile: async (data: any) => {
    try {
      const response = await apiClient.put("/users/fundi-profile", data);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Update fundi-profile failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  becomeFundi: async (userId: string) => {
    try {
      const response = await apiClient.post("/users/become-fundi", { userId });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Become fundi failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  searchFundis: async (params: any) => {
    try {
      const response = await apiClient.get("/users/fundis", { params });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Search fundis failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getFundiById: async (id: string) => {
    try {
      const response = await apiClient.get(`/users/fundis/${id}`);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get fundi failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getAllUsers: async () => {
    try {
      const response = await apiClient.get("/users/admin/all");
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get users failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getPendingApprovals: async () => {
    try {
      const response = await apiClient.get("/users/admin/pending-fundis");
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get pending approvals failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  updateFundiStatus: async (
    userId: string,
    status: string,
    reason?: string,
  ) => {
    try {
      const response = await apiClient.patch(
        `/users/admin/fundi/${userId}/status`,
        { status, reason },
      );
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Update fundi status failed",
        errors: err?.response?.data?.errors,
      };
    }
  },
};

export const messageService = {
  sendMessage: async (data: any) => {
    try {
      const response = await apiClient.post("/messages", data);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Send message failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getJobMessages: async (jobId: string) => {
    try {
      const response = await apiClient.get(`/messages/job/${jobId}`);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get job messages failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getConversations: async () => {
    try {
      const response = await apiClient.get("/messages/conversations");
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get conversations failed",
        errors: err?.response?.data?.errors,
      };
    }
  },
};

export const notificationService = {
  getNotifications: async (params?: any) => {
    try {
      const response = await apiClient.get("/notifications", { params });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get notifications failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  markAsRead: async (id: string) => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Mark as read failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await apiClient.patch("/notifications/read-all");
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Mark all as read failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await apiClient.get("/notifications/unread-count");
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get unread count failed",
        errors: err?.response?.data?.errors,
      };
    }
  },
};

export const reviewService = {
  createReview: async (data: any) => {
    try {
      const response = await apiClient.post("/reviews", data);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Create review failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getUserReviews: async (userId: string, params?: any) => {
    try {
      const response = await apiClient.get(`/reviews/user/${userId}`, {
        params,
      });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get user reviews failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  addResponse: async (reviewId: string, response: string) => {
    try {
      const res = await apiClient.patch(`/reviews/${reviewId}/response`, {
        response,
      });
      return res.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Add response failed",
        errors: err?.response?.data?.errors,
      };
    }
  },
};

export const serviceService = {
  getAllServices: async (params?: any) => {
    try {
      const response = await apiClient.get("/services", { params });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get services failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getServiceById: async (id: string) => {
    try {
      const response = await apiClient.get(`/services/${id}`);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get service failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get("/services/categories");
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get categories failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  createService: async (data: any) => {
    try {
      const response = await apiClient.post("/services", data);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Create service failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  updateService: async (id: string, data: any) => {
    try {
      const response = await apiClient.put(`/services/${id}`, data);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Update service failed",
        errors: err?.response?.data?.errors,
      };
    }
  },
};

export const adminService = {
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get("/admin/dashboard/stats");
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Get dashboard stats failed",
        errors: err?.response?.data?.errors,
      };
    }
  },
};

export const paymentService = {
  initiateEscrow: async (jobId: string, phoneNumber: string) => {
    try {
      const response = await apiClient.post(`/payments/escrow/${jobId}`, {
        phoneNumber,
      });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Payment initiation failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  verifyPayment: async (jobId: string) => {
    try {
      const response = await apiClient.post(`/payments/verify/${jobId}`);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Payment verification failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  releaseFunds: async (jobId: string) => {
    try {
      const response = await apiClient.post(`/payments/release/${jobId}`);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Fund release failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  refundPayment: async (jobId: string, reason: string) => {
    try {
      const response = await apiClient.post(`/payments/refund/${jobId}`, {
        reason,
      });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Refund failed",
        errors: err?.response?.data?.errors,
      };
    }
  },
};

export const uploadService = {
  // Upload single image
  uploadSingle: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiClient.post("/upload/single", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Image upload failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  // Upload multiple images
  uploadMultiple: async (files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await apiClient.post("/upload/multiple", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Images upload failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  // Delete image
  deleteImage: async (publicIdOrUrl: string) => {
    try {
      const encodedId = encodeURIComponent(publicIdOrUrl);
      const response = await apiClient.delete(`/upload/${encodedId}`);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Image deletion failed",
        errors: err?.response?.data?.errors,
      };
    }
  },
};

export const resetPasswordService = {
  requestReset: async (phoneNumber: string) => {
    try {
      const response = await apiClient.post("/password-reset/forgot-password", {
        phone: phoneNumber,
      });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message:
          err?.response?.data?.message || "Password reset request failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  resetPassword: async (
    phoneNumber: string,
    code: string,
    newPassword: string,
  ) => {
    try {
      const response = await apiClient.post("/password-reset/reset-password", {
        phone: phoneNumber,
        code,
        newPassword,
      });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Password reset failed",
        errors: err?.response?.data?.errors,
      };
    }
  },

  resendCode: async (phoneNumber: string) => {
    try {
      const response = await apiClient.post("/password-reset/resend-code", {
        phone: phoneNumber,
      });
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Failed to resend code",
        errors: err?.response?.data?.errors,
      };
    }
  },
};
