"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Users, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { taskService } from "@/api/services/taskService";
import { projectService } from "@/api/services/projectService";
import { userService } from "@/api/services/userService";
import AddCardModal, { CommentsPanel, type TaskComment } from "./AddCardModal";

type TaskCard = {
  id: string;
  title: string;
  description: string;
  due: string;
  dueDate: string | null;
  assignedToId: string | null;
  priority: "Low" | "Medium" | "High";
  severity: "MINOR" | "MAJOR" | "CRITICAL";
  completed: boolean;
};

type VerifiedMember = {
  userId: string;
  name: string;
  email: string;
};

type BoardColumn = {
  id: string;
  title: string;
  tasks: TaskCard[];
};

const buildBackgroundPath = (backgroundName: string) => `/assets/background/${backgroundName}.jpg`;

const defaultProject = {
  id: "p1",
  name: "SaaS Product Launch",
  owner: "Sagar",
  members: 6,
  progress: 64,
  description: "Core product launch board covering API delivery, UX, and release readiness.",
};

const initialBoard: BoardColumn[] = [
  {
    id: "c1",
    title: "Backlog",
    tasks: [
      {
        id: "t1",
        title: "Define sprint scope with product team",
        description: "Align goals and dependencies before sprint kickoff.",
        due: "Today",
        dueDate: null,
        assignedToId: null,
        priority: "High",
        severity: "CRITICAL",
        completed: false,
      },
      {
        id: "t2",
        title: "Collect dashboard analytics requirements",
        description: "Confirm key metrics and event naming with stakeholders.",
        due: "Tomorrow",
        dueDate: null,
        assignedToId: null,
        priority: "Medium",
        severity: "MAJOR",
        completed: false,
      },
    ],
  },
  {
    id: "c2",
    title: "In Progress",
    tasks: [
      {
        id: "t3",
        title: "Implement project permissions API",
        description: "Add role-based access checks and test edge cases.",
        due: "Thu",
        dueDate: null,
        assignedToId: null,
        priority: "High",
        severity: "CRITICAL",
        completed: false,
      },
      {
        id: "t4",
        title: "Design board card interactions",
        description: "Finalize drag states and hover behavior for cards.",
        due: "Fri",
        dueDate: null,
        assignedToId: null,
        priority: "Low",
        severity: "MINOR",
        completed: false,
      },
    ],
  },
  {
    id: "c3",
    title: "Review",
    tasks: [
      {
        id: "t5",
        title: "Validate auth flow integration",
        description: "Verify sign-in, refresh token, and logout path coverage.",
        due: "Fri",
        dueDate: null,
        assignedToId: null,
        priority: "Medium",
        severity: "MAJOR",
        completed: false,
      },
    ],
  },
  {
    id: "c4",
    title: "Done",
    tasks: [
      {
        id: "t6",
        title: "Set up login + OTP screens",
        description: "Initial auth UI implementation completed.",
        due: "Done",
        dueDate: null,
        assignedToId: null,
        priority: "Low",
        severity: "MINOR",
        completed: true,
      },
    ],
  },
];

const Project = () => {
  const searchParams = useSearchParams();
  const queryRole = String(searchParams?.get("role") || "").toUpperCase();
  const hasPrivilegedRoleFromQuery = queryRole === "OWNER" || queryRole === "ADMIN";
  const [board, setBoard] = useState<BoardColumn[]>(initialBoard);
  const [taskInput, setTaskInput] = useState<Record<string, string>>({});
  const [isCreatingTask, setIsCreatingTask] = useState<Record<string, boolean>>({});
  const [dragItem, setDragItem] = useState<{ fromColumnId: string; taskId: string } | null>(null);
  const [editingTask, setEditingTask] = useState<{ columnId: string; task: TaskCard } | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    assignedToId: "",
    priority: "Low" as TaskCard["priority"],
    severity: "MINOR" as TaskCard["severity"],
    dueDate: "",
  });
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showAssignList, setShowAssignList] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [verifiedMembers, setVerifiedMembers] = useState<VerifiedMember[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [canAddMember, setCanAddMember] = useState(hasPrivilegedRoleFromQuery);

  const priorityOptions: TaskCard["priority"][] = ["Low", "Medium", "High"];
  const severityOptions: TaskCard["severity"][] = ["MINOR", "MAJOR", "CRITICAL"];

  const getAssignedMemberLabel = () => {
    if (!editForm.assignedToId) {
      return "Unassigned";
    }

    const assignedMember = verifiedMembers.find((member) => member.userId === editForm.assignedToId);
    return assignedMember ? assignedMember.name : "Assigned";
  };

  const fromApiPriority = (priority: unknown): TaskCard["priority"] => {
    const value = String(priority ?? "").toUpperCase();
    if (value === "HIGH") return "High";
    if (value === "MEDIUM") return "Medium";
    return "Low";
  };

  const toApiPriority = (priority: TaskCard["priority"]): "LOW" | "MEDIUM" | "HIGH" => {
    if (priority === "High") return "HIGH";
    if (priority === "Medium") return "MEDIUM";
    return "LOW";
  };

  const toDateInputValue = (value: string | null | undefined): string => {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().slice(0, 10);
  };

  const toDueLabel = (value: string | null | undefined): string => {
    if (!value) {
      return "No date";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "No date";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const toCommentList = (response: any): TaskComment[] => {
    const rawList = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];

    return rawList.map((item: any) => {
      const commentId = String(item?.commentId || item?.id || `${Date.now()}-${Math.random()}`);
      const user = item?.user || item?.createdBy || null;
      const author = user?.name || user?.email || item?.authorName || "Unknown";

      return {
        commentId,
        comment: item?.comment || item?.content || "",
        author,
        createdAt: item?.createdAt || null,
      };
    });
  };

  const formatCommentTime = (value: string | null) => {
    if (!value) {
      return "Just now";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Just now";
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const projectBackground = useMemo(() => {
    const backgroundName = searchParams?.get("background");
    if (!backgroundName) {
      return null;
    }

    return buildBackgroundPath(backgroundName);
  }, [searchParams]);

  const currentProject = useMemo(() => {
    const members = Number(searchParams?.get("members"));

    return {
      id: searchParams?.get("projectId") || defaultProject.id,
      name: searchParams?.get("name") || defaultProject.name,
      owner: defaultProject.owner,
      ownerId: searchParams?.get("ownerId") || "",
      members: Number.isFinite(members) && members > 0 ? members : defaultProject.members,
      progress: defaultProject.progress,
      description: searchParams?.get("description") || defaultProject.description,
    };
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const resolveMemberPermission = async () => {
      if (hasPrivilegedRoleFromQuery) {
        if (isMounted) {
          setCanAddMember(true);
        }
        return;
      }

      try {
        const [currentUser, membersResponse] = await Promise.all([
          userService.getMe(),
          projectService.listMembers(currentProject.id, 1, 200),
        ]);

        const currentUserId = currentUser?.userId;
        const members = Array.isArray(membersResponse?.data) ? membersResponse.data : [];

        const matchedMember = members.find((entry: any) => {
          const user = entry?.user || entry;
          const userId = user?.userId || user?.id;
          return currentUserId && userId === currentUserId;
        });

        const memberRole = String(
          matchedMember?.role || matchedMember?.projectRole || matchedMember?.memberRole || "",
        ).toUpperCase();

        const isOwnerById = Boolean(currentProject.ownerId && currentUserId && currentProject.ownerId === currentUserId);
        const hasPermission = memberRole === "OWNER" || memberRole === "ADMIN" || isOwnerById;

        if (isMounted) {
          setCanAddMember(hasPermission);
        }
      } catch {
        if (isMounted) {
          setCanAddMember(false);
        }
      }
    };

    void resolveMemberPermission();

    return () => {
      isMounted = false;
    };
  }, [currentProject.id, currentProject.ownerId, hasPrivilegedRoleFromQuery]);

  const totalTasks = useMemo(
    () => board.reduce((sum, column) => sum + column.tasks.length, 0),
    [board],
  );

  const moveTask = (targetColumnId: string) => {
    if (!dragItem) {
      return;
    }

    const { fromColumnId, taskId } = dragItem;
    if (fromColumnId === targetColumnId) {
      setDragItem(null);
      return;
    }

    let movedTask: TaskCard | null = null;

    setBoard((prev) => {
      const withoutTask = prev.map((column) => {
        if (column.id !== fromColumnId) {
          return column;
        }

        const remaining = column.tasks.filter((task) => {
          if (task.id === taskId) {
            movedTask = task;
            return false;
          }
          return true;
        });

        return { ...column, tasks: remaining };
      });

      if (!movedTask) {
        return prev;
      }

      return withoutTask.map((column) =>
        column.id === targetColumnId
          ? { ...column, tasks: [...column.tasks, movedTask as TaskCard] }
          : column,
      );
    });

    setDragItem(null);
  };

  const priorityClass = (priority: TaskCard["priority"]) => {
    if (priority === "High") return "bg-red-100 text-red-700";
    if (priority === "Medium") return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  };

  const severityClass = (severity: TaskCard["severity"]) => {
    if (severity === "CRITICAL") return "bg-red-100 text-red-700";
    if (severity === "MAJOR") return "bg-amber-100 text-amber-700";
    return "bg-slate-200 text-slate-700";
  };

  const addTask = async (columnId: string) => {
    const value = (taskInput[columnId] ?? "").trim();
    if (!value) {
      return;
    }

    if (isCreatingTask[columnId]) {
      return;
    }

    setIsCreatingTask((prev) => ({
      ...prev,
      [columnId]: true,
    }));

    try {
      const defaultDueDate = new Date();
      defaultDueDate.setHours(0, 0, 0, 0);
      const defaultDueDateIso = defaultDueDate.toISOString();

      const response = await taskService.createTask({
        title: value,
        description: null,
        priority: "LOW",
        severity: "MINOR",
        dueDate: defaultDueDateIso,
        projectId: currentProject.id,
      });

      const resolvedDueDate = response?.dueDate || defaultDueDateIso;

      const newTask: TaskCard = {
        id: response?.taskId || response?.id || `t${Date.now()}`,
        title: response?.title || value,
        description: response?.description ?? "",
        due: toDueLabel(resolvedDueDate),
        dueDate: resolvedDueDate,
        assignedToId: response?.assignedToId || null,
        priority: fromApiPriority(response?.priority),
        severity: response?.severity || "MINOR",
        completed: false,
      };

      setBoard((prev) =>
        prev.map((column) =>
          column.id === columnId
            ? { ...column, tasks: [...column.tasks, newTask] }
            : column,
        ),
      );

      setTaskInput((prev) => ({
        ...prev,
        [columnId]: "",
      }));
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsCreatingTask((prev) => ({
        ...prev,
        [columnId]: false,
      }));
    }
  };

  const toggleTaskCompletion = (columnId: string, taskId: string) => {
    setBoard((prev) =>
      prev.map((column) =>
        column.id === columnId
          ? {
              ...column,
              tasks: column.tasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task,
              ),
            }
          : column,
      ),
    );
  };

  const openTaskEditor = (columnId: string, task: TaskCard) => {
    setEditingTask({ columnId, task });
    setEditForm({
      title: task.title,
      description: task.description,
      assignedToId: task.assignedToId || "",
      priority: task.priority,
      severity: task.severity,
      dueDate: toDateInputValue(task.dueDate),
    });
    setFormError("");
    setApiError("");
    setMembersError("");
    setCommentsError("");
    setCommentInput("");
    setIsFormDirty(false);
    setShowAssignList(false);
    void loadTaskComments(task.id);
  };

  const closeTaskEditor = () => {
    if (isUpdatingTask) {
      return;
    }

    if (isFormDirty) {
      const shouldClose = window.confirm("You have unsaved changes. Close without saving?");
      if (!shouldClose) {
        return;
      }
    }

    setEditingTask(null);
    setFormError("");
    setApiError("");
    setMembersError("");
    setCommentsError("");
    setCommentInput("");
    setComments([]);
    setIsFormDirty(false);
    setShowAssignList(false);
  };

  const loadTaskComments = async (taskId: string) => {
    setIsLoadingComments(true);
    setCommentsError("");

    try {
      const response = await taskService.getComments(taskId);
      setComments(toCommentList(response));
    } catch (error) {
      console.error("Failed to load comments:", error);
      setCommentsError("Unable to load comments right now.");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const addTaskComment = async () => {
    if (!editingTask || isPostingComment) {
      return;
    }

    const trimmedComment = commentInput.trim();
    if (!trimmedComment) {
      setCommentsError("Comment cannot be empty.");
      return;
    }

    setIsPostingComment(true);
    setCommentsError("");

    try {
      const response = await taskService.addComment(editingTask.task.id, trimmedComment);
      const createdComment = toCommentList(response)[0] || {
        commentId: `${Date.now()}`,
        comment: trimmedComment,
        author: "You",
        createdAt: new Date().toISOString(),
      };

      setComments((prev) => [createdComment, ...prev]);
      setCommentInput("");
    } catch (error) {
      console.error("Failed to add comment:", error);
      setCommentsError("Unable to add comment right now.");
    } finally {
      setIsPostingComment(false);
    }
  };

  const loadVerifiedMembers = async () => {
    if (isLoadingMembers) {
      return;
    }

    setIsLoadingMembers(true);
    setMembersError("");

    try {
      const response = await projectService.listMembers(currentProject.id, 1, 200);
      const members = Array.isArray(response?.data) ? response.data : [];

      const parsedMembers: VerifiedMember[] = members
        .map((member: any) => {
          const user = member?.user || member;
          const isVerified = user?.verified !== false;
          const userId = user?.userId || user?.id || "";
          if (!isVerified || !userId) {
            return null;
          }

          return {
            userId,
            name: user?.name || user?.email || "Unnamed member",
            email: user?.email || "",
          };
        })
        .filter((member: VerifiedMember | null): member is VerifiedMember => Boolean(member));

      setVerifiedMembers(parsedMembers);
    } catch (error) {
      console.error("Failed to load project members:", error);
      setMembersError("Unable to load verified members right now.");
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const toggleAssignList = async () => {
    const nextState = !showAssignList;
    setShowAssignList(nextState);

    if (nextState && verifiedMembers.length === 0) {
      await loadVerifiedMembers();
    }
  };

  const updateEditForm = (field: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFormError("");
    setApiError("");
    setIsFormDirty(true);
  };

  const saveTaskEdits = async () => {
    if (!editingTask) {
      return;
    }

    const trimmedTitle = editForm.title.trim();
    if (!trimmedTitle) {
      setFormError("Task name is required.");
      return;
    }

    if (!priorityOptions.includes(editForm.priority)) {
      setFormError("Please select a valid priority.");
      return;
    }

    if (!severityOptions.includes(editForm.severity)) {
      setFormError("Please select a valid severity.");
      return;
    }

    const payload = {
      title: trimmedTitle,
      description: editForm.description.trim() || undefined,
      assignedToId: editForm.assignedToId || undefined,
      priority: toApiPriority(editForm.priority),
      severity: editForm.severity,
      dueDate: editForm.dueDate ? new Date(`${editForm.dueDate}T00:00:00`).toISOString() : undefined,
    };

    setIsUpdatingTask(true);
    setApiError("");

    try {
      const response = await taskService.updateTask(editingTask.task.id, payload);
      const resolvedDueDate = response?.dueDate ?? payload.dueDate ?? null;

      setBoard((prev) =>
        prev.map((column) =>
          column.id === editingTask.columnId
            ? {
                ...column,
                tasks: column.tasks.map((task) =>
                  task.id === editingTask.task.id
                    ? {
                        ...task,
                        title: response?.title ?? payload.title,
                        description: response?.description ?? payload.description ?? "",
                        assignedToId: response?.assignedToId ?? payload.assignedToId ?? null,
                        priority: fromApiPriority(response?.priority ?? payload.priority),
                        severity: response?.severity ?? payload.severity,
                        dueDate: resolvedDueDate,
                        due: toDueLabel(resolvedDueDate),
                      }
                    : task,
                ),
              }
            : column,
        ),
      );

      setEditingTask(null);
      setIsFormDirty(false);
    } catch (error) {
      console.error("Failed to update task:", error);
      setApiError("Unable to update task right now. Please try again.");
    } finally {
      setIsUpdatingTask(false);
    }
  };

  return (
    <section
      className="min-h-[calc(100vh-5rem)] bg-cover bg-center bg-no-repeat py-4 px-2 sm:px-3 lg:px-4"
      style={
        projectBackground
          ? {
              backgroundImage: `url(${projectBackground})`,
              backgroundAttachment: "fixed",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      <div className="mx-auto max-w-full">
        <div className="mb-6 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-200 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Project</p>
            {canAddMember ? (
              <button
                type="button"
                className="h-9 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Add member
              </button>
            ) : null}
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{currentProject.name}</h1>
          <p className="mt-2 text-sm text-slate-600">{currentProject.description}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white/70 p-3">
              <p className="text-xs text-slate-500">Owner</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{currentProject.owner}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white/70 p-3">
              <p className="text-xs text-slate-500">Members</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-slate-800">
                <Users size={14} />
                {currentProject.members}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white/70 p-3">
              <p className="text-xs text-slate-500">Tasks</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Task Board</h2>
          <p className="text-sm text-slate-500">Drag and drop tasks between columns to update status.</p>
        </div>

        <div className="overflow-x-auto pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-start gap-4">
            {board.map((column) => (
              <div
                key={column.id}
                className="h-fit w-[min(22rem,calc(100vw-2rem))] sm:w-88 rounded-2xl bg-slate-100/70 p-3 ring-1 ring-slate-200"
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => moveTask(column.id)}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{column.title}</p>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200">
                    {column.tasks.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {column.tasks.map((task) => (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={() => setDragItem({ fromColumnId: column.id, taskId: task.id })}
                      onClick={() => openTaskEditor(column.id, task)}
                      className="cursor-grab rounded-xl bg-white/70 p-3 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5"
                    >
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleTaskCompletion(column.id, task.id);
                          }}
                          className="mt-0.5 inline-flex text-slate-500 transition hover:text-slate-700"
                          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                        >
                          {task.completed ? (
                            <CheckCircle2 size={18} className="text-emerald-600" />
                          ) : (
                            <Circle size={18} />
                          )}
                        </button>
                        <p className={`text-sm font-medium ${task.completed ? "text-slate-500 line-through" : "text-slate-900"}`}>
                          {task.title}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-medium ${priorityClass(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-medium ${severityClass(task.severity)}`}
                          >
                            {task.severity}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">{task.due}</span>
                      </div>
                    </article>
                  ))}

                  <AddCardModal
                    value={taskInput[column.id] ?? ""}
                    disabled={Boolean(isCreatingTask[column.id])}
                    onChange={(value) =>
                      setTaskInput((prev) => ({
                        ...prev,
                        [column.id]: value,
                      }))
                    }
                    onSubmit={() => addTask(column.id)}
                    ariaLabel={`Add card to ${column.title}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingTask ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
          onClick={closeTaskEditor}
        >
          <div
            className="w-full max-w-5xl rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200 sm:p-5"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Edit task"
          >
            <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Edit Task</h3>
                  <button
                    type="button"
                    onClick={closeTaskEditor}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close edit task form"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Task Name</label>
                    <input
                      value={editForm.title}
                      onChange={(event) => updateEditForm("title", event.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none ring-sky-300 transition focus:ring"
                      placeholder="Task title"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(event) => updateEditForm("description", event.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none ring-sky-300 transition focus:ring"
                      placeholder="Add details"
                    />
                  </div>

                  <div>
                    <p className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Assign</p>
                    <button
                      type="button"
                      onClick={toggleAssignList}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-left text-sm text-slate-800 outline-none ring-sky-300 transition hover:bg-slate-50 focus:ring"
                    >
                      {isLoadingMembers ? "Loading members..." : getAssignedMemberLabel()}
                    </button>

                    {showAssignList ? (
                      <div className="mt-2 max-h-44 overflow-auto rounded-lg border border-slate-200 bg-white p-1">
                        <button
                          type="button"
                          onClick={() => {
                            updateEditForm("assignedToId", "");
                            setShowAssignList(false);
                          }}
                          className="w-full rounded-md px-2 py-1.5 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                        >
                          Unassigned
                        </button>

                        {verifiedMembers.map((member) => (
                          <button
                            type="button"
                            key={member.userId}
                            onClick={() => {
                              updateEditForm("assignedToId", member.userId);
                              setShowAssignList(false);
                            }}
                            className="w-full rounded-md px-2 py-1.5 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                          >
                            <span className="block font-medium text-slate-800">{member.name}</span>
                            {member.email ? <span className="block text-xs text-slate-500">{member.email}</span> : null}
                          </button>
                        ))}

                        {!isLoadingMembers && !membersError && verifiedMembers.length === 0 ? (
                          <p className="px-2 py-1.5 text-sm text-slate-500">No verified members found.</p>
                        ) : null}
                      </div>
                    ) : null}

                    {membersError ? <p className="mt-1 text-sm text-red-600">{membersError}</p> : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Priority</label>
                      <select
                        value={editForm.priority}
                        onChange={(event) => updateEditForm("priority", event.target.value)}
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none ring-sky-300 transition focus:ring"
                      >
                        {priorityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Severity</label>
                      <select
                        value={editForm.severity}
                        onChange={(event) => updateEditForm("severity", event.target.value)}
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none ring-sky-300 transition focus:ring"
                      >
                        {severityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Due Date</label>
                      <input
                        type="date"
                        value={editForm.dueDate}
                        onChange={(event) => updateEditForm("dueDate", event.target.value)}
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none ring-sky-300 transition focus:ring"
                      />
                    </div>
                  </div>

                  {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
                  {apiError ? <p className="text-sm text-red-600">{apiError}</p> : null}

                  <div className="pt-1 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeTaskEditor}
                      disabled={isUpdatingTask}
                      className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveTaskEdits}
                      disabled={isUpdatingTask}
                      className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdatingTask ? "Updating..." : "Update"}
                    </button>
                  </div>
                </div>
              </div>

              <CommentsPanel
                commentInput={commentInput}
                comments={comments}
                commentsError={commentsError}
                isLoadingComments={isLoadingComments}
                isPostingComment={isPostingComment}
                onCommentChange={(value) => {
                  setCommentInput(value);
                  setCommentsError("");
                }}
                onPostComment={() => void addTaskComment()}
                formatCommentTime={formatCommentTime}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default Project;
