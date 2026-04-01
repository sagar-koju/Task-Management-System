"use client";

import { FormEvent, useMemo, useState } from "react";
import { Mail, Plus, Search, ShieldCheck, Users, UserRoundMinus, X } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
};

type ProjectMembers = {
  id: string;
  name: string;
  status: "Active" | "Planning";
  members: TeamMember[];
};

const initialProjectData: ProjectMembers[] = [
  {
    id: "p1",
    name: "SaaS Product Launch",
    status: "Active",
    members: [
      { id: "u1", name: "Sagar", email: "sagar@taskflow.dev", role: "Owner" },
      { id: "u2", name: "Ananya", email: "ananya@taskflow.dev", role: "Admin" },
      { id: "u3", name: "Rohan", email: "rohan@taskflow.dev", role: "Member" },
    ],
  },
  {
    id: "p2",
    name: "Mobile App Revamp",
    status: "Planning",
    members: [
      { id: "u4", name: "Mia", email: "mia@taskflow.dev", role: "Owner" },
      { id: "u5", name: "Noah", email: "noah@taskflow.dev", role: "Member" },
    ],
  },
  {
    id: "p3",
    name: "Marketing Sprint",
    status: "Active",
    members: [
      { id: "u6", name: "Ravi", email: "ravi@taskflow.dev", role: "Owner" },
      { id: "u7", name: "Priya", email: "priya@taskflow.dev", role: "Admin" },
      { id: "u8", name: "Vikram", email: "vikram@taskflow.dev", role: "Member" },
      { id: "u9", name: "Leena", email: "leena@taskflow.dev", role: "Member" },
    ],
  },
];

const roleClassMap: Record<TeamMember["role"], string> = {
  Owner: "bg-violet-100 text-violet-700",
  Admin: "bg-sky-100 text-sky-700",
  Member: "bg-slate-100 text-slate-700",
};

const Member = () => {
  const [projects, setProjects] = useState<ProjectMembers[]>(initialProjectData);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectData[0].id);
  const [projectQuery, setProjectQuery] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("Member");
  const [inviteError, setInviteError] = useState("");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId],
  );

  const filteredProjects = useMemo(() => {
    const query = projectQuery.trim().toLowerCase();
    if (!query) {
      return projects;
    }

    return projects.filter((project) => project.name.toLowerCase().includes(query));
  }, [projects, projectQuery]);

  const handleInvite = (event: FormEvent) => {
    event.preventDefault();

    const name = inviteName.trim();
    const email = inviteEmail.trim().toLowerCase();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !email) {
      setInviteError("Name and email are required.");
      return;
    }

    if (!isEmailValid) {
      setInviteError("Please enter a valid email address.");
      return;
    }

    const duplicateMember = selectedProject.members.some((member) => member.email.toLowerCase() === email);
    if (duplicateMember) {
      setInviteError("This email is already part of the selected project.");
      return;
    }

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name,
      email,
      role: inviteRole,
    };

    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === selectedProject.id
          ? { ...project, members: [newMember, ...project.members] }
          : project,
      ),
    );

    setInviteName("");
    setInviteEmail("");
    setInviteRole("Member");
    setInviteError("");
  };

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-linear-to-br from-slate-100 via-white to-sky-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200 md:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Team Management</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Project Members</h1>
          <p className="mt-1 text-sm text-slate-600">
            Select a project to view its team, then invite new members with role-based access.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
          <aside className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ShieldCheck size={16} />
              Projects
            </div>

            <div className="relative mb-3">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={projectQuery}
                onChange={(event) => setProjectQuery(event.target.value)}
                placeholder="Search projects"
                className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-500"
              />
            </div>

            <div className="space-y-2">
              {filteredProjects.map((project) => {
                const isActive = project.id === selectedProjectId;
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      isActive
                        ? "border-sky-500 bg-sky-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{project.name}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          project.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-600">
                      <Users size={13} />
                      {project.members.length} members
                    </p>
                  </button>
                );
              })}

              {filteredProjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                  No projects match your search.
                </div>
              ) : null}
            </div>
          </aside>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{selectedProject.name} Members</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {selectedProject.members.length} team members
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedProject.members.map((member) => (
                  <article
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 transition hover:bg-slate-50 hover:ring-2 hover:ring-sky-400"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-blue-600 text-sm font-semibold text-white">
                          {member.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                          <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Mail size={12} />
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${roleClassMap[member.role]}`}
                        >
                          {member.role}
                        </span>
                        <UserRoundMinus
                          size={16}
                          className="cursor-pointer rounded-full text-rose-500 hover:bg-gray-200"
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:p-5">
              <h3 className="mb-3 text-base font-semibold text-slate-900">Invite Member</h3>
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleInvite}>
                <input
                  value={inviteName}
                  onChange={(event) => setInviteName(event.target.value)}
                  placeholder="Full name"
                  className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-sky-500"
                />
                <input
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  type="email"
                  placeholder="Email address"
                  className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-sky-500"
                />

                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as TeamMember["role"])}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                  <option value="Owner">Owner</option>
                </select>

                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-1 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-500"
                >
                  <Plus size={16} />
                  Send Invite
                </button>
              </form>

              {inviteError ? <p className="mt-3 text-sm text-rose-600">{inviteError}</p> : null}
            </div>
          </div>
        </div>
      </div>

      {selectedMember ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Member Profile</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{selectedMember.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close profile modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedMember.name}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedMember.email}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${roleClassMap[selectedMember.role]}`}
                >
                  {selectedMember.role}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default Member;
