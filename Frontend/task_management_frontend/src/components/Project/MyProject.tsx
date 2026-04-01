"use client";

import React, { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  CircleDot,
  ClipboardList,
  Plus,
  Users,
} from "lucide-react";

type Project = {
  id: string;
  name: string;
  owner: string;
  members: number;
  progress: number;
  color: string;
};

type TaskCard = {
  id: string;
  title: string;
  assignee: string;
  due: string;
  priority: "Low" | "Medium" | "High";
};

type BoardColumn = {
  id: string;
  title: string;
  tasks: TaskCard[];
};

const initialProjects: Project[] = [
  {
    id: "p1",
    name: "SaaS Product Launch",
    owner: "Sagar",
    members: 6,
    progress: 64,
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "p2",
    name: "Mobile App Revamp",
    owner: "Ananya",
    members: 4,
    progress: 38,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "p3",
    name: "Marketing Sprint",
    owner: "Rohan",
    members: 5,
    progress: 79,
    color: "from-orange-500 to-amber-600",
  },
];

const initialBoard: BoardColumn[] = [
  {
    id: "c1",
    title: "Backlog",
    tasks: [
      {
        id: "t1",
        title: "Define sprint scope with product team",
        assignee: "SG",
        due: "Today",
        priority: "High",
      },
      {
        id: "t2",
        title: "Collect dashboard analytics requirements",
        assignee: "AN",
        due: "Tomorrow",
        priority: "Medium",
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
        assignee: "RK",
        due: "Thu",
        priority: "High",
      },
      {
        id: "t4",
        title: "Design board card interactions",
        assignee: "SP",
        due: "Fri",
        priority: "Low",
      },
    ],
  },
  {
    id: "c3",
    title: "Can Do",
    tasks: [
      {
        id: "t5",
        title: "Can Do auth flow integration",
        assignee: "VS",
        due: "Fri",
        priority: "Medium",
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
        assignee: "SG",
        due: "Done",
        priority: "Low",
      },
    ],
  },
];

const MyProject = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [projectName, setProjectName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjects[0].id);
  const [board, setBoard] = useState<BoardColumn[]>(initialBoard);
  const [taskInput, setTaskInput] = useState<Record<string, string>>({});
  const [dragItem, setDragItem] = useState<{ fromColumnId: string; taskId: string } | null>(null);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId],
  );

  const addProject = () => {
    const trimmedName = projectName.trim();
    if (!trimmedName) {
      return;
    }

    const newProject: Project = {
      id: `p${Date.now()}`,
      name: trimmedName,
      owner: "You",
      members: 1,
      progress: 0,
      color: "from-slate-600 to-slate-800",
    };

    setProjects((prev) => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
    setProjectName("");
  };

  const addTask = (columnId: string) => {
    const value = taskInput[columnId]?.trim() ?? "";
    if (!value) {
      return;
    }

    const newTask: TaskCard = {
      id: `t${Date.now()}`,
      title: value,
      assignee: "YO",
      due: "No date",
      priority: "Low",
    };

    setBoard((prev) =>
      prev.map((column) =>
        column.id === columnId ? { ...column, tasks: [...column.tasks, newTask] } : column,
      ),
    );

    setTaskInput((prev) => ({ ...prev, [columnId]: "" }));
  };

  const moveTask = (targetColumnId: string) => {
    if (!dragItem) {
      return;
    }

    const { fromColumnId, taskId } = dragItem;
    if (fromColumnId === targetColumnId) {
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
        column.id === targetColumnId ? { ...column, tasks: [...column.tasks, movedTask as TaskCard] } : column,
      );
    });

    setDragItem(null);
  };

  const priorityClass = (priority: TaskCard["priority"]) => {
    if (priority === "High") return "bg-red-100 text-red-700";
    if (priority === "Medium") return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  };

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-linear-to-b from-slate-100 via-white to-slate-100 py-4 px-2 sm:px-3 lg:px-4">
      <div className="relative mx-auto max-w-full">
        <div className="mb-6 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">My Projects</p>
              <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Create a new project"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-sky-300 transition focus:ring sm:w-64"
              />
              <button
                type="button"
                onClick={addProject}
                className="inline-flex h-10 items-center gap-1 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const active = project.id === selectedProjectId;
              return (
                <button
                  type="button"
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-sky-500 bg-sky-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className={`h-2 w-16 rounded-full bg-linear-to-r ${project.color}`} />
                  <h2 className="mt-3 text-sm font-semibold text-slate-900">{project.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">Owner: {project.owner}</p>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Users size={14} />
                      {project.members} members
                    </span>
                    <span>{project.progress}% done</span>
                  </div>

                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                    <div
                      style={{ width: `${project.progress}%` }}
                      className="h-full rounded-full bg-linear-to-r from-sky-500 to-cyan-500"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{selectedProject?.name} Board</h3>
            <p className="text-sm text-slate-500">Drag cards across columns to update status</p>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
              <ClipboardList size={14} />
              {board.reduce((sum, column) => sum + column.tasks.length, 0)} tasks
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
              <CalendarClock size={14} />
              Sprint week
            </span>
          </div>
        </div>

        <div className="overflow-x-auto pb-3">
          <div className="flex min-w-max gap-4">
            {board.map((column) => (
              <div
                key={column.id}
                className="w-72.5 rounded-2xl bg-slate-100 p-3 ring-1 ring-slate-200"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => moveTask(column.id)}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{column.title}</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200">
                    {column.tasks.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {column.tasks.map((task) => (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={() => setDragItem({ fromColumnId: column.id, taskId: task.id })}
                      className="cursor-grab rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5"
                    >
                      <p className="text-sm font-medium text-slate-900">{task.title}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-medium ${priorityClass(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs text-slate-500">{task.due}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          {column.id === "c4" ? <CheckCircle2 size={14} /> : <CircleDot size={14} />}
                          {column.title}
                        </span>
                        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-white">{task.assignee}</span>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-3 rounded-lg bg-white p-2 ring-1 ring-slate-200">
                  <div className="flex items-center gap-2">
                    <input
                      value={taskInput[column.id] ?? ""}
                      onChange={(e) =>
                        setTaskInput((prev) => ({
                          ...prev,
                          [column.id]: e.target.value,
                        }))
                      }
                      placeholder="Add a card"
                      className="h-9 flex-1 rounded-md border border-slate-200 px-2 text-sm outline-none ring-sky-300 transition focus:ring"
                    />
                    <button
                      type="button"
                      onClick={() => addTask(column.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white transition hover:bg-slate-700"
                      aria-label="Add card"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyProject;
