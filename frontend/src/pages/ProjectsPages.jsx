import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Users,
  Settings,
  MoreVertical,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  ArrowLeft,
  CheckSquare,
  AlertCircle,
  Flag,
  Zap,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Badge,
  ProgressBar,
  Avatar,
  AvatarGroup,
  Button,
  LoadingState,
  ErrorState,
  EmptyState,
  Modal,
} from "../components/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/projects", {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
        },
      });
      setProjects(res.data.projects || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [search, statusFilter]);

  const isManager = user?.role === "PROJECT_MANAGER";

  return (
    <div>
      <PageHeader
        eyebrow="Initiatives & Portfolios"
        title="Projects"
        description="Monitor deliverables, manage contributors, and keep schedules on target."
        actions={
          isManager && (
            <Button icon={Plus} onClick={() => navigate("/projects/new")}>
              Create Project
            </Button>
          )
        }
      />

      {/* Filter toolbar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#ffffff",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: "6px 12px",
            minWidth: 260,
          }}
        >
          <Search size={15} color="var(--text-light)" />
          <input
            type="text"
            placeholder="Filter projects by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              background: "none",
              outline: "none",
              fontSize: 13,
              width: "100%",
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select"
          style={{ width: 160 }}
        >
          <option value="">All Statuses</option>
          <option value="PLANNED">Planned</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {loading ? (
        <LoadingState message="Fetching project portfolio..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadProjects} />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Create your first project initiative to start tracking tasks and deadlines."
          action={
            isManager && (
              <Button icon={Plus} onClick={() => navigate("/projects/new")}>
                Create Project
              </Button>
            )
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 18,
          }}
        >
          {projects.map((proj) => {
            const progress =
              proj.progress ||
              (proj.status === "COMPLETED"
                ? 100
                : proj.status === "ACTIVE"
                  ? 45
                  : 10);
            return (
              <Card
                key={proj._id}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <Badge tone={proj.status}>{proj.status}</Badge>
                    </div>
                    <Link
                      to={`/projects/${proj._id}`}
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#0f172a",
                        display: "block",
                      }}
                    >
                      {proj.name}
                    </Link>
                  </div>

                  {isManager && proj.manager?._id === user?.id && (
                    <Link
                      to={`/projects/${proj._id}/settings`}
                      style={{ color: "var(--text-light)", padding: 4 }}
                      title="Project Settings"
                    >
                      <Settings size={16} />
                    </Link>
                  )}
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    minHeight: 38,
                  }}
                >
                  {proj.description || "No detailed specification provided."}
                </p>

                {/* Progress bar */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      marginBottom: 6,
                    }}
                  >
                    <span>Completion Rate</span>
                    <span>{progress}%</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>

                {/* Footer meta */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTop: "1px solid var(--border-subtle)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Calendar size={14} />
                    <span>
                      Due{" "}
                      {new Date(proj.deadline).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <AvatarGroup users={proj.members || []} max={3} size="xs" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ProjectFormPage({ edit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: new Date().toISOString().slice(0, 10),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    status: "PLANNED",
    members: [],
  });

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(edit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const uRes = await api
          .get("/users")
          .catch(() => ({ data: { users: [] } }));
        setUsersList(uRes.data.users || []);

        if (edit) {
          const res = await api.get(`/projects/${id}`);
          const p = res.data.project;
          setForm({
            name: p.name || "",
            description: p.description || "",
            startDate: p.startDate ? p.startDate.slice(0, 10) : "",
            deadline: p.deadline ? p.deadline.slice(0, 10) : "",
            status: p.status || "PLANNED",
            members: p.members ? p.members.map((m) => m._id || m) : [],
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to initialize project form.",
        );
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [edit, id]);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleMember(userId) {
    setForm((prev) => {
      const exists = prev.members.includes(userId);
      return {
        ...prev,
        members: exists
          ? prev.members.filter((m) => m !== userId)
          : [...prev.members, userId],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (edit) {
        await api.put(`/projects/${id}`, form);
        navigate(`/projects/${id}`);
      } else {
        const res = await api.post("/projects", form);
        navigate(`/projects/${res.data.project._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save project.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return <LoadingState message="Loading project configuration..." />;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--text-muted)",
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <PageHeader
        eyebrow="Portfolio Architecture"
        title={edit ? "Edit Project" : "Create New Project"}
        description="Configure target timelines, team members, and delivery milestones."
      />

      <Card>
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#991b1b",
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              name="name"
              type="text"
              className="form-input"
              placeholder="e.g. NextGen Web Portal"
              value={form.name}
              onChange={update}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Project Description</label>
            <textarea
              name="description"
              rows={3}
              className="form-textarea"
              placeholder="Summary of product goals and scope..."
              value={form.description}
              onChange={update}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                name="startDate"
                type="date"
                className="form-input"
                value={form.startDate}
                onChange={update}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Deadline *</label>
              <input
                name="deadline"
                type="date"
                className="form-input"
                value={form.deadline}
                onChange={update}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lifecycle Status</label>
            <select
              name="status"
              className="form-select"
              value={form.status}
              onChange={update}
            >
              <option value="PLANNED">Planned (Scoping)</option>
              <option value="ACTIVE">Active (In Development)</option>
              <option value="COMPLETED">Completed (Archived)</option>
            </select>
          </div>

          {/* Members Multi-select */}
          {!edit && (
            <div className="form-group">
              <label className="form-label">Assign Team Members</label>
              <div
                style={{
                  maxHeight: 180,
                  overflowY: "auto",
                  border: "1px solid var(--border-default)",
                  borderRadius: 8,
                  padding: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {usersList.length === 0 ? (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-light)",
                      padding: 6,
                    }}
                  >
                    No other workspace members available.
                  </p>
                ) : (
                  usersList.map((u) => {
                    const isChecked = form.members.includes(u._id);
                    return (
                      <label
                        key={u._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "6px 8px",
                          borderRadius: 6,
                          background: isChecked
                            ? "var(--primary-subtle)"
                            : "#ffffff",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMember(u._id)}
                        />
                        <Avatar name={u.name} avatar={u.avatar} size="xs" />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {u.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--text-light)",
                            marginLeft: "auto",
                          }}
                        >
                          {u.role === "PROJECT_MANAGER" ? "PM" : "Member"}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 20,
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : edit
                  ? "Update Project"
                  : "Create Project"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjectDetails() {
      setLoading(true);
      try {
        const [pRes, tRes, iRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get("/tasks", { params: { project: id } }),
          api.get("/issues", { params: { project: id } }),
        ]);
        setProject(pRes.data.project);
        setTasks(tRes.data.tasks || []);
        setIssues(iRes.data.issues || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load project details.",
        );
      } finally {
        setLoading(false);
      }
    }
    loadProjectDetails();
  }, [id]);

  if (loading) return <LoadingState message="Loading project workspace..." />;
  if (error || !project)
    return (
      <ErrorState
        message={error || "Project not found."}
        onRetry={() => navigate("/projects")}
      />
    );

  const isManager =
    user?.role === "PROJECT_MANAGER" && project.manager?._id === user?.id;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const progressPct = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : project.progress || 0;

  return (
    <div>
      <button
        onClick={() => navigate("/projects")}
        style={{
          background: "none",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--text-muted)",
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={16} /> All Projects
      </button>

      <PageHeader
        eyebrow={`Project / ${project.status}`}
        title={project.name}
        description={
          project.description ||
          "Overview of scope, deliverables, and assignments."
        }
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link to={`/projects/${id}/milestones`}>
              <Button variant="secondary" size="sm" icon={Flag}>
                Milestones
              </Button>
            </Link>
            <Link to={`/projects/${id}/sprints`}>
              <Button variant="secondary" size="sm" icon={Zap}>
                Sprints
              </Button>
            </Link>
            {isManager && (
              <Link to={`/projects/${id}/settings`}>
                <Button variant="secondary" size="sm" icon={Settings}>
                  Settings
                </Button>
              </Link>
            )}
            <Button
              size="sm"
              icon={Plus}
              onClick={() => navigate("/tasks/new")}
            >
              Add Task
            </Button>
          </div>
        }
      />

      {/* Overview Stat Grid */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <Card style={{ padding: 16 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Project Manager
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
            }}
          >
            <Avatar
              name={project.manager?.name || "Manager"}
              avatar={project.manager?.avatar}
              size="sm"
            />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {project.manager?.name}
            </span>
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Timeline Target
          </span>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#0f172a",
              marginTop: 8,
            }}
          >
            {new Date(project.startDate).toLocaleDateString()} —{" "}
            {new Date(project.deadline).toLocaleDateString()}
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Tasks Delivered
          </span>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#0f172a",
              marginTop: 8,
            }}
          >
            {completedTasks} of {tasks.length} ({progressPct}%)
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Blockers Logged
          </span>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: issues.length ? "#ef4444" : "#10b981",
              marginTop: 8,
            }}
          >
            {issues.filter((i) => i.status === "OPEN").length} open (
            {issues.length} total)
          </div>
        </Card>
      </div>

      {/* Project Progress */}
      <Card style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
            Overall Progress
          </span>
          <span
            style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}
          >
            {progressPct}%
          </span>
        </div>
        <ProgressBar value={progressPct} />
      </Card>

      {/* Two Column Layout: Tasks List & Members List */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 20,
        }}
      >
        {/* Tasks in this Project */}
        <Card>
          <div className="card-header">
            <div>
              <h3 className="card-title">Project Tasks ({tasks.length})</h3>
              <p className="card-subtitle">
                Deliverables scheduled under this initiative
              </p>
            </div>
            <Link
              to="/tasks"
              style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}
            >
              Open Board
            </Link>
          </div>

          {tasks.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              No tasks linked to this project yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tasks.map((t) => (
                <div
                  key={t._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, marginRight: 10 }}>
                    <Link
                      to={`/tasks/${t._id}`}
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.title}
                    </Link>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Assigned to {t.assignedTo?.name || "Unassigned"}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Badge tone={t.priority}>{t.priority}</Badge>
                    <Badge tone={t.status}>{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Members & Team */}
        <Card>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                Project Contributors ({project.members?.length || 0})
              </h3>
              <p className="card-subtitle">
                Active engineers and collaborators
              </p>
            </div>
            {isManager && (
              <Link
                to={`/projects/${id}/settings`}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--primary)",
                }}
              >
                Manage
              </Link>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 8,
                background: "#f8fafc",
                borderRadius: 8,
              }}
            >
              <Avatar
                name={project.manager?.name}
                avatar={project.manager?.avatar}
                size="sm"
              />
              <div>
                <strong style={{ fontSize: 13, display: "block" }}>
                  {project.manager?.name}
                </strong>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {project.manager?.email} • Project Lead
                </span>
              </div>
            </div>

            {project.members?.map((m) => (
              <div
                key={m._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "4px 8px",
                }}
              >
                <Avatar name={m.name} avatar={m.avatar} size="xs" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{ fontSize: 13, fontWeight: 500, display: "block" }}
                  >
                    {m.name}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-light)" }}>
                    {m.email}
                  </span>
                </div>
                <Badge tone="low">Member</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function ProjectSettingsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  async function loadData() {
    setLoading(true);
    try {
      const [pRes, uRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get("/users").catch(() => ({ data: { users: [] } })),
      ]);
      setProject(pRes.data.project);
      setAllUsers(uRes.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load project settings.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleAddMember(e) {
    e.preventDefault();
    if (!memberEmail) return;
    setError("");
    setSuccess("");
    try {
      const res = await api.post(`/projects/${id}/members`, {
        email: memberEmail,
      });
      setProject(res.data.project);
      setMemberEmail("");
      setSuccess("Member added to project successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member.");
    }
  }

  async function handleRemoveMember(memberId) {
    if (!window.confirm("Remove this collaborator from the project?")) return;
    setError("");
    setSuccess("");
    try {
      const res = await api.delete(`/projects/${id}/members/${memberId}`);
      setProject(res.data.project);
      setSuccess("Member removed from project.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member.");
    }
  }

  async function handleDeleteProject() {
    if (
      !window.confirm(
        "Are you absolutely sure you want to permanently delete this project? All associated tasks will remain orphaned.",
      )
    )
      return;
    try {
      await api.delete(`/projects/${id}`);
      navigate("/projects");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete project.");
    }
  }

  if (loading) return <LoadingState message="Loading project settings..." />;
  if (!project) return <ErrorState message="Project not found." />;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <button
        onClick={() => navigate(`/projects/${id}`)}
        style={{
          background: "none",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--text-muted)",
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={16} /> Back to Project Overview
      </button>

      <PageHeader
        eyebrow="Configuration"
        title="Project Settings"
        description={`Manage membership, permissions, and lifecycle for ${project.name}.`}
        actions={
          <Link to={`/projects/${id}/edit`}>
            <Button variant="secondary" size="sm" icon={Edit}>
              Edit Metadata
            </Button>
          </Link>
        }
      />

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fee2e2",
            color: "#991b1b",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #d1fae5",
            color: "#065f46",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {success}
        </div>
      )}

      {/* Member Management */}
      <Card style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Manage Contributors</h3>
            <p className="card-subtitle">
              Invite workspace members to collaborate on this initiative
            </p>
          </div>
        </div>

        <form
          onSubmit={handleAddMember}
          style={{ display: "flex", gap: 10, marginBottom: 20 }}
        >
          <input
            type="email"
            className="form-input"
            placeholder="member@company.com"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            required
          />
          <Button type="submit" icon={Plus}>
            Add Member
          </Button>
        </form>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {project.members?.map((m) => (
            <div
              key={m._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={m.name} avatar={m.avatar} size="xs" />
                <div>
                  <strong style={{ fontSize: 13, display: "block" }}>
                    {m.name}
                  </strong>
                  <span style={{ fontSize: 11, color: "var(--text-light)" }}>
                    {m.email}
                  </span>
                </div>
              </div>

              {m._id !== project.manager?._id && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(m._id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    padding: 4,
                  }}
                  title="Remove from project"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card style={{ borderColor: "#fca5a5", background: "#fffafa" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ color: "#b91c1c" }}>
              Danger Zone
            </h3>
            <p className="card-subtitle">
              Irreversible actions regarding this project
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div>
            <strong
              style={{ fontSize: 13, color: "#0f172a", display: "block" }}
            >
              Delete this project
            </strong>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                margin: "4px 0 0",
              }}
            >
              Permanently remove this project and unlink all associated
              activity.
            </p>
          </div>
          <Button variant="danger" icon={Trash2} onClick={handleDeleteProject}>
            Delete Project
          </Button>
        </div>
      </Card>
    </div>
  );
}
