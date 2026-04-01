// src/api/services/authService.ts
import { apiClient } from "@/lib/apiClient";
import { endpoints } from "@/api/endpoints";

export const authService = {
  async login(payload: { email: string; password: string }) {
    
    const { data } = await apiClient.post(endpoints.auth.login, payload);
    return data;
  },

  async logout() {
    const { data } = await apiClient.post(endpoints.auth.logout);
    return data;
  },
  
  async register(payload: { name: string; email: string; password: string }) {
    const { data } = await apiClient.post(endpoints.auth.register, payload);
    return data;
  },

  async verifyEmail(payload: { email: string; otp: string }) {
    const { data } = await apiClient.post(endpoints.auth.verifyEmail, payload);
    return data;
  },

  async verifyOtp(payload: { email: string; otp: string }) {
    const { data } = await apiClient.post(endpoints.auth.verifyOtp, payload);
    return data;
  },

  async resendOtp(payload: { email: string }) {
    const { data } = await apiClient.post(endpoints.auth.resendOtp, payload);
    return data;

  }
};