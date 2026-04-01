"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, LayoutGrid, Lock, Plus, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { projectService } from "@/api/services/projectService";
import { userService } from "@/api/services/userService";
import dayjs from "dayjs";

const getTimeAgo = (timestamp: string) => {
  const time = dayjs(timestamp);

  if (!time.isValid()) {
    return "-";
  }

  const now = dayjs();
  const hours = now.diff(time, "hour");

  if (hours < 1) {
    return "recently";
  }

  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }

  const days = now.diff(time, "day");
  return `${days} day${days === 1 ? "" : "s"}`;
};

type BoardVisibility = "PRIVATE" | "PUBLIC";

type BoardItem = {
  id: string;
  title: string;
  description: string;
  members: number;
  updatedAt: string;
  visibility: BoardVisibility;
  background: string;
};

type ApiProject = {
  projectId?: string;
  id?: string;
  name?: string;
  description?: string;
  ownerId?: string;
  visibility?: BoardVisibility | string;
  updatedAt?: string;
};

const initialCreatedBoards: BoardItem[] = [];

const initialMemberBoards: BoardItem[] = [
  {
    id: "board-3",
    title: "Client Roadmap",
    description: "Milestones and delivery alignment with clients.",
    members: 11,
    updatedAt: "2026-03-24 03:12:22",
    visibility: "PUBLIC",
    background: "Ocean",
  },
  {
    id: "board-4",
    title: "QA Validation",
    description: "Test cycles, bug triage, and release sign-off.",
    members: 6,
    updatedAt: "2026-03-24 03:12:22",
    visibility: "PRIVATE",
    background: "Bridge",
  },
];

const backgroundOptions = ["Mountain", "City", "Ocean", "Bridge", "Branch"];

const buildBackgroundPath = (backgroundName: string) => `/assets/background/${backgroundName}.jpg`;

const normalizeVisibility = (visibility: string | undefined): BoardVisibility => {
  return visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE";
};

const mapProjectToBoard = (project: ApiProject, index: number): BoardItem => ({
  id: project.projectId || project.id || `board-${Date.now()}-${index}`,
  title: project.name || "Untitled Board",
  description: project.description || "No description provided.",
  members: 1,
  updatedAt: project.updatedAt || dayjs().format("YYYY-MM-DD HH:mm:ss"),
  visibility: normalizeVisibility(project.visibility),
  background: backgroundOptions[index % backgroundOptions.length],
});

const Board = () => {
  const router = useRouter();
  const [createdBoards, setCreatedBoards] = useState<BoardItem[]>(initialCreatedBoards);
  const [memberBoards] = useState<BoardItem[]>(initialMemberBoards);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [newBoardVisibility, setNewBoardVisibility] = useState<BoardVisibility>("PRIVATE");
  const [selectedBackground, setSelectedBackground] = useState(backgroundOptions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOwnedProjects = async () => {
      setIsLoadingBoards(true);

      try {
        const [currentUser, listResponse] = await Promise.all([
          userService.getMe(),
          projectService.list(),
        ]);

        const userId = currentUser?.userId;
        const projects: ApiProject[] = Array.isArray(listResponse?.data)
          ? listResponse.data
          : Array.isArray(listResponse)
            ? listResponse
            : [];

        const ownedProjects = userId
          ? projects.filter((project) => project.ownerId === userId)
          : [];

        if (isMounted) {
          setCreatedBoards(ownedProjects.map((project, index) => mapProjectToBoard(project, index)));
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch projects");
        }
      } finally {
        if (isMounted) {
          setIsLoadingBoards(false);
        }
      }
    };

    loadOwnedProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalBoards = useMemo(
    () => createdBoards.length + memberBoards.length,
    [createdBoards, memberBoards],
  );
  const privateBoards = useMemo(
    () => [...createdBoards, ...memberBoards].filter((board) => board.visibility === "PRIVATE").length,
    [createdBoards, memberBoards],
  );

  const createBoard = async () => {
    const title = newBoardTitle.trim();
    if (!title) {
      setError("Board title is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await projectService.create({
        name: title,
        description: newBoardDescription.trim() || "New board created from workspace.",
        visibility: newBoardVisibility,
      });

      const freshBoard: BoardItem = {
        id: response.projectId || response.id || `board-${Date.now()}`,
        title: response.name || title,
        description: response.description || newBoardDescription.trim() || "New board created from workspace.",
        members: 1,
        updatedAt: response.updatedAt || dayjs().format("YYYY-MM-DD HH:mm:ss"),
        visibility: normalizeVisibility(response.visibility),
        background: selectedBackground,
      };

      setCreatedBoards((prevBoards) => [freshBoard, ...prevBoards]);
      setNewBoardTitle("");
      setNewBoardDescription("");
      setNewBoardVisibility("PRIVATE");
      setSelectedBackground(backgroundOptions[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board");
      console.error("Error creating board:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const goToProjectPage = (board: BoardItem) => {
    const query = new URLSearchParams({
      view: "project",
      projectId: board.id,
      name: board.title,
      description: board.description,
      members: String(board.members),
      visibility: board.visibility,
      updatedAt: board.updatedAt,
      background: board.background,
    });

    router.push(`/dashboard?${query.toString()}`);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-cyan-50 via-white to-amber-50 py-4 px-2 sm:px-3 lg:px-4">
      <div className="pointer-events-none absolute -left-28 top-8 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-4 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-full space-y-2">
        <header className="rounded-2xl border border-cyan-100 bg-white/90 p-4 shadow-lg shadow-cyan-100/40 backdrop-blur sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Project Workspace</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-3xl">Boards</h1>
              <p className="mt-1 text-sm text-slate-600">Design collaborative spaces with visual backgrounds and clear ownership.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                <p className="text-xs uppercase tracking-wider text-green-700">Total</p>
                <p className="text-xl font-semibold">{totalBoards}</p>
              </div>
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-cyan-900">
                <p className="text-xs uppercase tracking-wider text-cyan-700">Created</p>
                <p className="text-xl font-semibold">{createdBoards.length}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-amber-900 col-span-2 sm:col-span-1">
                <p className="text-xs uppercase tracking-wider text-amber-700">Private</p>
                <p className="text-xl font-semibold">{privateBoards}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Create Board Form */}
        <div className="grid gap-6">
          <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-md shadow-slate-200/40 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Plus size={18} className="text-cyan-700" />
              <h2 className="text-xl font-semibold text-slate-800">Create New Board</h2>
            </div>

            <div className="flex flex-col gap-3 w-160">
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(event) => setNewBoardTitle(event.target.value)}
                  placeholder="Board title"
                  className="w-full max-w-2xl rounded-xl border md:full sm:w-full border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500"
                />

                <select
                  value={newBoardVisibility}
                  onChange={(event) => setNewBoardVisibility(event.target.value as BoardVisibility)}
                  className="w-full sm:w-auto max-w-40 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500"
                >
                  <option value="PRIVATE">Private</option>
                  <option value="PUBLIC">Public</option>
                </select>
              </div>
              <textarea
                value={newBoardDescription}
                onChange={(event) => setNewBoardDescription(event.target.value)}
                placeholder="Board description"
                rows={3}
                className="max-w-500 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 sm:col-span-2"
              />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Choose Background</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {backgroundOptions.map((backgroundName) => {
                  const isSelected = selectedBackground === backgroundName;

                  return (
                    <button
                      key={backgroundName}
                      type="button"
                      onClick={() => setSelectedBackground(backgroundName)}
                      className={`shrink-0 rounded-xl border p-1 transition ${isSelected
                          ? "border-cyan-500 bg-cyan-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-cyan-300"
                        }`}
                    >
                      <Image
                        src={buildBackgroundPath(backgroundName)}
                        alt={`${backgroundName} background`}
                        width={120}
                        height={72}
                        className="h-16 w-28 rounded-lg object-cover"
                      />
                      <p className="mt-1 text-center text-xs font-medium text-slate-700">{backgroundName}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}
            <button
              onClick={createBoard}
              disabled={isLoading}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={15} /> {isLoading ? "Creating..." : "Create Board"}
            </button>
          </article>
        </div>

        <div className="grid gap-6">
          <article className="rounded-3xl  border border-slate-200 bg-white/90 p-5 shadow-md shadow-slate-200/40 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <LayoutGrid size={18} className="text-cyan-700" />
              <h2 className="text-lg font-semibold text-slate-800">Previously Created Boards</h2>
            </div>
            <div className="grid lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-3 gap-4">
              {isLoadingBoards && (
                <p className="text-sm text-slate-500">Loading your boards...</p>
              )}
              {createdBoards.map((board) => (
                <button
                  type="button"
                  key={board.id}
                  onClick={() => goToProjectPage(board)}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left shadow-sm transition hover:border-cyan-300 hover:shadow-md"
                >
                  <Image
                    src={buildBackgroundPath(board.background)}
                    alt={`${board.title} background`}
                    width={520}
                    height={118}
                    className="h-24 w-full object-cover"
                  />
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xs font-semibold text-slate-800">{board.title}</h3>
                      <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">
                        {getTimeAgo(board.updatedAt)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                        <Users size={13} />
                        {board.members} members
                      </p>
                      <p className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {board.visibility === "PRIVATE" ? <Lock size={14} className="text-red-500" /> : <Eye size={14} className="text-green-500"/>}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-md shadow-slate-200/40 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Users size={18} className="text-cyan-700" />
              <h2 className="text-lg font-semibold text-slate-800">Member Boards</h2>
            </div>
            <div className="grid lg:grid-cols-5 sm:grid-cols-3 gap-4">
              {memberBoards.map((board) => (
                <button
                  type="button"
                  key={board.id}
                  onClick={() => goToProjectPage(board)}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left shadow-sm transition hover:border-cyan-300 hover:shadow-md"
                >
                  <Image
                    src={buildBackgroundPath(board.background)}
                    alt={`${board.title} background`}
                    width={520}
                    height={118}
                    className="h-24 w-full object-cover"
                  />
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xs font-semibold text-slate-800">{board.title}</h3>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        {getTimeAgo(board.updatedAt)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <p className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                        <Users size={13} />
                        {board.members} members
                      </p>
                      <p className="inline-flex items-center gap-1 rounded-full  px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {board.visibility === "PRIVATE" ? <Lock size={14} className="text-red-500" /> : <Eye size={14} className="text-green-500"/>}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-3xl  border border-slate-200 bg-white/90 p-5 shadow-md shadow-slate-200/40 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Eye size={18} className="text-green-600" />
              <h2 className="text-lg font-semibold text-slate-800">Public Boards</h2>
            </div>
            <div className="grid lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-3 gap-4">
              {isLoadingBoards && (
                <p className="text-sm text-slate-500">Loading public boards...</p>
              )}
              {[...createdBoards, ...memberBoards]
                .filter((board) => board.visibility === "PUBLIC")
                .length === 0 && !isLoadingBoards && (
                <p className="text-sm text-slate-500">No public boards available</p>
              )}
              {[...createdBoards, ...memberBoards]
                .filter((board) => board.visibility === "PUBLIC")
                .map((board) => (
                <button
                  type="button"
                  key={board.id}
                  onClick={() => goToProjectPage(board)}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left shadow-sm transition hover:border-cyan-300 hover:shadow-md"
                >
                  <Image
                    src={buildBackgroundPath(board.background)}
                    alt={`${board.title} background`}
                    width={520}
                    height={118}
                    className="h-24 w-full object-cover"
                  />
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xs font-semibold text-slate-800">{board.title}</h3>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        {getTimeAgo(board.updatedAt)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                        <Users size={13} />
                        {board.members} members
                      </p>
                      <p className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {board.visibility === "PRIVATE" ? <Lock size={14} className="text-red-500" /> : <Eye size={14} className="text-green-500"/>}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Board;
