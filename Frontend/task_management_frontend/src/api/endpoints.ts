import { send } from "process";

// src/api/endpoints.ts
export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    register: "/users/register",
    verifyEmail: "/users/verify-email",
    verifyOtp: "/otp/verify",
    resendOtp: "/otp/resend",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  user: {
    me: "/users/profile",
    updateProfile: "/users/profile/update",
  },
  projects: {
    project: "/projects",
    createProjects: "/projects",
    updateProjectDetails: (projectId: string) => `/projects/${projectId}`,
    deleteProject: (projectId: string) => `/projects/${projectId}`,
    addProjectMember: (projectId: string) => `/projects/${projectId}/members`,
    listMembers: (projectId: string) => `/projects/${projectId}/members`,
    changeMemberRole: (projectId: string, userId: string) => `/projects/${projectId}/members/${userId}/role`,
    removeMember: (projectId: string, userId: string) => `/projects/${projectId}/members/${userId}`,
    sendInvitation: (projectId: string) => `/projects/${projectId}/invite`,
  },
  tasks: {
      createTask: "/tasks",
      updateTask: (taskId: string) => `/tasks/${taskId}`,
      deleteTask: (taskId: string) => `/tasks/${taskId}`,
      updateTaskStatus: (taskId: string) => `/tasks/${taskId}/status`,
      getMyTask: `/tasks/my-tasks`,
      filterTask: (projectId: string) => `/tasks/project/${projectId}`,
      addComment: (taskId: string) => `/tasks/${taskId}/comments`,
      getComments: (taskId: string) => `/tasks/${taskId}/comments`,
      deleteComment: (commentId: string) => `/tasks/comments/${commentId}`,
      uploadAttachment: (taskId: string) => `/tasks/${taskId}/upload`,
      getAttachments: (taskId: string) => `/tasks/${taskId}/attachments`,
  },

};