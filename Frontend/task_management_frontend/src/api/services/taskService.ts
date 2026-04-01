import { apiClient } from "@/lib/apiClient";
import { endpoints } from "@/api/endpoints";
import { create } from "domain";

export const taskService = {
    async createTask(taskData: { title: string; description?: string | null; priority: string; severity?: string; dueDate?: string; assignedToId?: string; projectId: string }) {
        try {
            const response = await apiClient.post(endpoints.tasks.createTask, taskData);
            return response.data;
        } catch (error) {
            console.error("Error creating task:", error);
            throw error;
        }
    },
    async updateTask(taskId: string, taskData: { title?: string; description?: string | null; priority?: string; severity?: string; dueDate?: string; assignedToId?: string }) {
        try {
            const response = await apiClient.put(endpoints.tasks.updateTask(taskId), taskData);
            return response.data;
        } catch (error) {
            console.error("Error updating task:", error);
            throw error;
        }
    },
    async deleteTask(taskId: string) {
        try {
            const response = await apiClient.delete(endpoints.tasks.deleteTask(taskId));
            return response.data;
        } catch (error) {
            console.error("Error deleting task:", error);
            throw error;
        }
    },
    async updateTaskStatus(taskId: string, status: string) {
        try {
            const response = await apiClient.put(endpoints.tasks.updateTaskStatus(taskId), { status });
            return response.data;
        } catch (error) {
            console.error("Error updating task status:", error);
            throw error;
        }
    },
    async getMyTasks() {
        try {
            const response = await apiClient.get(endpoints.tasks.getMyTask);
            return response.data;
        } catch (error) {
            console.error("Error fetching my tasks:", error);
            throw error;
        }
    },
    async filterTasksByProject(projectId: string) {
        try {
            const response = await apiClient.get(endpoints.tasks.filterTask(projectId));
            return response.data;
        } catch (error) {
            console.error("Error filtering tasks by project:", error);
            throw error;
        }
    },
    async addComment(taskId: string, comment: string) {
        try {
            const response = await apiClient.post(endpoints.tasks.addComment(taskId), { comment });
            return response.data;
        } catch (error) {
            console.error("Error adding comment:", error);
            throw error;
        }
    },
    async getComments(taskId: string) {
        try {
            const response = await apiClient.get(endpoints.tasks.getComments(taskId));
            return response.data;
        } catch (error) {
            console.error("Error fetching comments:", error);
            throw error;
        }
    },
    async deleteComment(commentId: string) {
        try {
            const response = await apiClient.delete(endpoints.tasks.deleteComment(commentId));
            return response.data;
        } catch (error) {
            console.error("Error deleting comment:", error);
            throw error;
        }
    },
    async uploadAttachment(taskId: string, file: File) {
        try {
            const formData = new FormData();
            formData.append("file", file);
        } catch (error) {
            console.error("Error uploading attachment:", error);
            throw error;
        }
    },
    async getAttachments(taskId: string) {
        try {
            const response = await apiClient.get(endpoints.tasks.getAttachments(taskId));
            return response.data;
        } catch (error) {
            console.error("Error fetching attachments:", error);
            throw error;
        }
    },
}