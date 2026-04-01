import { apiClient } from "@/lib/apiClient";
import { endpoints } from "@/api/endpoints";

export const userService = {
  async getMe() {
    const { data } = await apiClient.get(endpoints.user.me);
    return data?.data ?? data;
  },
    async updateProfile(payload: { name?: string; email?: string }) {
    const { data } = await apiClient.put(endpoints.user.updateProfile, payload);
     return data;
    }
};