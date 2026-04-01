// src/api/services/projectService.ts
import { apiClient } from "@/lib/apiClient";
import { endpoints } from "@/api/endpoints";

export const projectService = {
  async list() {
    const { data } = await apiClient.get(endpoints.projects.project);
    return data;
  },

  async create(payload: { name: string; description?: string, visibility: "PUBLIC" | "PRIVATE" }) {
    const { data } = await apiClient.post(endpoints.projects.createProjects, payload);
    return data;
  },

  async update(projectId: string, payload: { name?: string; description?: string, visibility?: "PUBLIC" | "PRIVATE" }) {
    const { data } = await apiClient.put(endpoints.projects.updateProjectDetails(projectId), payload);
    return data;
  },

  async listMembers(projectId: string, page = 1, limit = 100) {
    const { data } = await apiClient.get(endpoints.projects.listMembers(projectId), {
      params: { page, limit },
    });
    return data;
  }

};