import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleAlert,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Target,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import { MilestonesPage, SprintsPage } from "./pages/PlanningPages.jsx";
import { AuthPage } from "./pages/AuthPages.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import { ROLE_LABELS } from "./components/Sidebar.jsx";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  Button,
} from "./components/UI.jsx";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useAuth } from "./context/AuthContext.jsx";
import api from "./services/api.js";

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  );
}

function ProjectError({ message }) {
  return message ? (
    <div className="form-error">
      <XCircle size={16} />
      {message}
    </div>
  ) : null;
}

function ProjectsPage() {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [otherProjects, setOtherProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/projects", {
        params: { search: query || undefined, status: status || undefined },
      });
      setMyProjects(response.data.myProjects || response.data.projects || []);
      setOtherProjects(response.data.otherProjects || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load projects.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [query, status]);

  async function deleteProject(id) {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await api.delete(`/projects/${id}`);
      setMyProjects((current) =>
        current.filter((project) => project._id !== id),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to delete project.",
      );
    }
  }

  const canCreate =
    user?.role === "ORGANISATION_ADMIN" ||
    user?.role === "PROJECT_MANAGER" ||
    user?.role === "TEAM_LEAD";
  const canManageProject = (p) =>
    user?.role === "ORGANISATION_ADMIN" ||
    (user?.role === "PROJECT_MANAGER" &&
      ((p.manager?._id || p.manager) === user?.id ||
        (p.manager?._id || p.manager) === user?._id));

  function renderProjectCard(project, readOnly = false) {
    return (
      <Card className="project-card" key={project._id}>
        <div className="project-card-top">
          <div className="project-avatar large">{project.name[0]}</div>
          <div>
            {readOnly ? (
              <Badge tone="planned">Read only</Badge>
            ) : (
              <>
                {canManageProject(project) && (
                  <Link
                    className="more-button"
                    to={`/projects/${project._id}/edit`}
                  >
                    <MoreHorizontal size={18} />
                  </Link>
                )}
                {canManageProject(project) && (
                  <button
                    className="more-button"
                    onClick={() => deleteProject(project._id)}
                    title="Delete project"
                  >
                    <X size={16} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <Badge tone={project.status}>{project.status}</Badge>
        <h2>
          <Link to={`/projects/${project._id}`}>{project.name}</Link>
        </h2>
        <p>{project.description || "No description provided."}</p>
        <div className="project-progress">
          <div>
            <span>Progress</span>
            <strong>{project.progress ?? 0}%</strong>
          </div>
          <ProgressBar
            value={
              project.progress ??
              (project.status === "COMPLETED"
                ? 100
                : project.status === "ACTIVE"
                  ? 50
                  : 0)
            }
          />
        </div>
        <div className="project-meta">
          {readOnly ? (
            <>
              <span>Manager: {project.manager?.name || "Unassigned"}</span>
              <span>Team Lead: {project.teamLead?.name || "Unassigned"}</span>
            </>
          ) : (
            <span>
              <Users size={15} />
              {project.members?.length || 0} members
            </span>
          )}
          <span>
            <CalendarDays size={15} />
            {project.deadline
              ? new Date(project.deadline).toLocaleDateString()
              : "No deadline"}
          </span>
        </div>
      </Card>
    );
  }

  const visibleProjects = [...myProjects, ...otherProjects];

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="Manage your team's work in one place."
        action={
          canCreate && (
            <Link to="/projects/new" className="button button-primary">
              <Plus size={16} />
              New project
            </Link>
          )
        }
      />
      <div className="toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects..."
          />
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="PLANNED">Planned</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
      <ProjectError message={error} />
      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          Loading projects...
        </div>
      ) : visibleProjects.length === 0 ? (
        <Card className="report-chart-card">
          <EmptyState
            title="No projects yet"
            description="Create a project to start organizing your team's work."
            action={
              canCreate && (
                <Link to="/projects/new" className="button button-primary">
                  Create project
                </Link>
              )
            }
          />
        </Card>
      ) : (
        <>
          {myProjects.length > 0 && (
            <section className="project-section">
              <div className="section-heading">
                <h2>My Projects</h2>
                <span>{myProjects.length}</span>
              </div>
              <div className="project-card-grid">
                {myProjects.map((project) => renderProjectCard(project))}
              </div>
            </section>
          )}
          {otherProjects.length > 0 && (
            <section className="project-section">
              <div className="section-heading">
                <h2>Other Projects</h2>
                <span>Read only</span>
              </div>
              <div className="project-card-grid">
                {otherProjects.map((project) =>
                  renderProjectCard(project, true),
                )}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

function TasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    onlyMine: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canCreate =
    user?.role === "ORGANISATION_ADMIN" ||
    user?.role === "PROJECT_MANAGER" ||
    user?.role === "TEAM_LEAD";
  const canDelete =
    user?.role === "ORGANISATION_ADMIN" || user?.role === "PROJECT_MANAGER";
  const isStakeholder = user?.role === "STAKEHOLDER";

  async function loadTasks() {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks", {
        params: {
          status: filters.status || undefined,
          priority: filters.priority || undefined,
        },
      });
      let taskList = data.tasks || [];
      if (filters.onlyMine && user) {
        taskList = taskList.filter(
          (t) => (t.assignedTo?._id || t.assignedTo) === user.id,
        );
      }
      setItems(taskList);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [filters.status, filters.priority, filters.onlyMine]);

  async function updateStatus(task, status) {
    if (isStakeholder) return;
    try {
      const { data } = await api.patch(`/tasks/${task._id}`, { status });
      setItems((current) =>
        current.map((item) => (item._id === task._id ? data.task : item)),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update task.",
      );
    }
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setItems((current) => current.filter((task) => task._id !== id));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to delete task.",
      );
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title={
          user?.role === "MEMBER" && filters.onlyMine ? "My Tasks" : "Tasks"
        }
        description={
          isStakeholder
            ? "Read-only view of authorized tasks across projects."
            : "Keep priorities clear and work moving."
        }
        action={
          canCreate && (
            <Button icon={Plus} onClick={() => navigate("/tasks/new")}>
              New task
            </Button>
          )
        }
      />
      <div className="toolbar">
        {user?.role === "MEMBER" && (
          <Button
            variant={filters.onlyMine ? "primary" : "secondary"}
            onClick={() => setFilters((f) => ({ ...f, onlyMine: !f.onlyMine }))}
          >
            {filters.onlyMine
              ? "Showing: Assigned to me"
              : "Show only my tasks"}
          </Button>
        )}
        <select
          value={filters.status}
          onChange={(event) =>
            setFilters({ ...filters, status: event.target.value })
          }
        >
          <option value="">All statuses</option>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select
          value={filters.priority}
          onChange={(event) =>
            setFilters({ ...filters, priority: event.target.value })
          }
        >
          <option value="">All priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>
      <ProjectError message={error} />
      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          Loading tasks...
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            title="No tasks found"
            description="Create a task or adjust your filters to see work here."
          />
        </Card>
      ) : (
        <Card className="table-card">
          <div className="data-table">
            <div className="table-row table-head">
              <span>Task</span>
              <span>Project</span>
              <span>Assignee</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Due date</span>
            </div>
            {items.map((task) => {
              const isAssignee =
                (task.assignedTo?._id || task.assignedTo) === user?.id;
              const canEditStatus = !isStakeholder && (canCreate || isAssignee);
              return (
                <div className="table-row" key={task._id}>
                  <span className="task-title">
                    <span
                      className={`task-check ${task.status === "COMPLETED" ? "done" : ""}`}
                    >
                      {task.status === "COMPLETED" && <Check size={12} />}
                    </span>
                    <Link to={`/tasks/${task._id}`}>
                      <strong>{task.title}</strong>
                    </Link>
                  </span>
                  <span>{task.project?.name}</span>
                  <span className="assignee">
                    <Avatar name={task.assignedTo?.name || "User"} size="sm" />
                    {task.assignedTo?.name}
                  </span>
                  <span>
                    <Badge tone={task.priority}>{task.priority}</Badge>
                  </span>
                  <span>
                    {canEditStatus ? (
                      <select
                        className="inline-select"
                        value={task.status}
                        onChange={(event) =>
                          updateStatus(task, event.target.value)
                        }
                      >
                        <option value="TODO">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    ) : (
                      <Badge tone={task.status}>
                        {task.status.replace("_", " ")}
                      </Badge>
                    )}
                  </span>
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  {canDelete && (
                    <button
                      className="more-button"
                      onClick={() => deleteTask(task._id)}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}

function TaskForm({ edit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projectsList, setProjectsList] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(edit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/projects"),
      edit ? api.get(`/tasks/${id}`) : Promise.resolve(null),
    ])
      .then(([projectsResponse, taskResponse]) => {
        const projects =
          projectsResponse.data.myProjects ||
          projectsResponse.data.projects ||
          [];
        setProjectsList(projects);
        if (taskResponse) {
          const task = taskResponse.data.task;
          setProjectName(task.project?.name || "");
          setForm({
            title: task.title,
            description: task.description || "",
            project: task.project?._id,
            assignedTo: task.assignedTo?._id,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate?.slice(0, 10),
          });
        }
      })
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Unable to load task form.",
        ),
      )
      .finally(() => setLoading(false));
  }, [edit, id]);

  const selectedProject = projectsList.find(
    (project) => project._id === form.project,
  );
  const isTeamLead = user?.role === "TEAM_LEAD";

  const eligibleAssignees = useMemo(() => {
    if (!selectedProject) return [];
    const list = [];
    if (selectedProject.manager) list.push(selectedProject.manager);
    if (selectedProject.teamLead) list.push(selectedProject.teamLead);
    if (Array.isArray(selectedProject.members))
      list.push(...selectedProject.members);
    const seen = new Set();
    return list.filter((item) => {
      const uId = (item?._id || item)?.toString();
      if (!uId || seen.has(uId)) return false;
      seen.add(uId);
      return true;
    });
  }, [selectedProject]);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    const project = isTeamLead
      ? projectsList.find(
          (item) =>
            item.name.toLowerCase() === projectName.trim().toLowerCase(),
        )
      : selectedProject;
    if (isTeamLead && !project) {
      setError("Enter the name of a project you lead or select a suggestion.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = isTeamLead ? { ...form, project: project._id } : form;
      const response = edit
        ? await api.put(`/tasks/${id}`, payload)
        : await api.post("/tasks", payload);
      navigate(`/tasks/${response.data.task._id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save task.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
        Loading task...
      </div>
    );

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title={edit ? "Edit task" : "New task"}
        description="Create a clear, accountable next step."
      />
      <Card className="form-card">
        <form onSubmit={submit}>
          <label>
            Title
            <input
              name="title"
              value={form.title}
              onChange={update}
              required
              placeholder="Task title"
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              rows="4"
              placeholder="Add context"
            />
          </label>
          <label>
            Project
            {isTeamLead ? (
              <>
                <input
                  name="projectName"
                  value={projectName}
                  onChange={(event) => {
                    const value = event.target.value;
                    const project = projectsList.find(
                      (item) =>
                        item.name.toLowerCase() === value.trim().toLowerCase(),
                    );
                    setProjectName(value);
                    setForm({
                      ...form,
                      project: project?._id || "",
                      assignedTo: "",
                    });
                  }}
                  list="team-lead-projects"
                  placeholder="Type the project name"
                  required
                />
                <datalist id="team-lead-projects">
                  {projectsList.map((project) => (
                    <option key={project._id} value={project.name} />
                  ))}
                </datalist>
              </>
            ) : (
              <select
                name="project"
                value={form.project}
                onChange={(event) =>
                  setForm({
                    ...form,
                    project: event.target.value,
                    assignedTo: "",
                  })
                }
                required
              >
                <option value="">Select project</option>
                {projectsList.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label>
            Assigned member
            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={update}
              required
            >
              <option value="">Select member</option>
              {eligibleAssignees.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} (
                  {ROLE_LABELS[member.role] || member.role || "Member"})
                </option>
              ))}
            </select>
          </label>
          <div className="form-row">
            <label>
              Priority
              <select name="priority" value={form.priority} onChange={update}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>
            <label>
              Due date
              <input
                name="dueDate"
                value={form.dueDate}
                onChange={update}
                type="date"
                required
              />
            </label>
          </div>
          <ProjectError message={error} />
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : edit ? "Save changes" : "Create task"}
          </Button>
        </form>
      </Card>
    </>
  );
}

function TaskDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/tasks/${id}`)
      .then(({ data }) => setTask(data.task))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Unable to load task.",
        ),
      );
  }, [id]);

  async function deleteTask() {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      navigate("/tasks");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to delete task.",
      );
    }
  }

  if (!task)
    return error ? (
      <ProjectError message={error} />
    ) : (
      <div className="loading-screen">
        <div className="spinner" />
        Loading task...
      </div>
    );

  const canManage =
    user?.role === "ORGANISATION_ADMIN" ||
    user?.role === "PROJECT_MANAGER" ||
    user?.role === "TEAM_LEAD";
  const canDelete =
    user?.role === "ORGANISATION_ADMIN" || user?.role === "PROJECT_MANAGER";

  return (
    <>
      <PageHeader
        eyebrow="Task details"
        title={task.title}
        description={task.description || "No description provided."}
        action={
          <div className="hero-actions">
            {canManage && (
              <Link
                to={`/tasks/${id}/edit`}
                className="button button-secondary"
              >
                Edit task
              </Link>
            )}
            {canDelete && (
              <Button variant="danger" onClick={deleteTask}>
                Delete
              </Button>
            )}
          </div>
        }
      />
      <Card className="detail-card">
        <div className="section-heading">
          <h2>Task information</h2>
          <Badge tone={task.status}>{task.status.replace("_", " ")}</Badge>
        </div>
        <div className="project-meta">
          <span>Project: {task.project?.name}</span>
          <span>Priority: {task.priority}</span>
          <span>Assigned to: {task.assignedTo?.name}</span>
          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      </Card>
    </>
  );
}

function KanbanCard({ task, overlay = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task._id });
  const style =
    transform && !overlay
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined;
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${isDragging ? "kanban-dragging" : ""} ${overlay ? "kanban-overlay" : ""}`}
      {...listeners}
      {...attributes}
    >
      <div className="kanban-card-top">
        <Badge tone={task.priority}>{task.priority}</Badge>
        <MoreHorizontal size={17} />
      </div>
      <h3>
        <Link to={`/tasks/${task._id}`}>{task.title}</Link>
      </h3>
      <p>{task.project?.name}</p>
      <div className="kanban-card-foot">
        <span className="assignee">
          <Avatar name={task.assignedTo?.name || "User"} size="sm" />
          {task.assignedTo?.name}
        </span>
        <span>
          <CalendarDays size={14} />
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
      </div>
    </Card>
  );
}

function KanbanColumn({ status, label, tasks: columnTasks }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? "kanban-column-over" : ""}`}
    >
      <div className="kanban-heading">
        <span>
          <i className={`column-dot ${status.toLowerCase()}`} />
          {label}
        </span>
        <small>{columnTasks.length}</small>
      </div>
      {columnTasks.map((task) => (
        <KanbanCard task={task} key={task._id} />
      ))}
      {columnTasks.length === 0 && (
        <div className="kanban-empty">Drop tasks here</div>
      )}
    </div>
  );
}

function KanbanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const columns = [
    ["TODO", "To do"],
    ["IN_PROGRESS", "In progress"],
    ["COMPLETED", "Completed"],
  ];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTask, setActiveTask] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const isStakeholder = user?.role === "STAKEHOLDER";
  const canCreate =
    user?.role === "ORGANISATION_ADMIN" ||
    user?.role === "PROJECT_MANAGER" ||
    user?.role === "TEAM_LEAD";

  useEffect(() => {
    api
      .get("/tasks")
      .then(({ data }) => setItems(data.tasks || []))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Unable to load tasks.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  async function moveTask(task, status) {
    if (isStakeholder) {
      setError(
        "Stakeholders have read-only visibility. Task updates are disabled.",
      );
      return;
    }
    if (user?.role === "MEMBER") {
      const assignedId = (task.assignedTo?._id || task.assignedTo)?.toString();
      if (assignedId !== user?.id) {
        setError("Members may only update status for tasks assigned to them.");
        return;
      }
    }
    const previous = items;
    setItems((current) =>
      current.map((item) =>
        item._id === task._id ? { ...item, status } : item,
      ),
    );
    try {
      const { data } = await api.patch(`/tasks/${task._id}`, { status });
      setItems((current) =>
        current.map((item) => (item._id === task._id ? data.task : item)),
      );
      setError("");
    } catch (requestError) {
      setItems(previous);
      setError(
        requestError.response?.data?.message || "Unable to update task status.",
      );
    }
  }

  function onDragStart({ active }) {
    if (isStakeholder) return;
    setActiveTask(items.find((task) => task._id === active.id) || null);
  }

  function onDragEnd({ active, over }) {
    setActiveTask(null);
    if (isStakeholder) return;
    const task = items.find((item) => item._id === active.id);
    if (
      task &&
      over &&
      columns.some(([status]) => status === over.id) &&
      task.status !== over.id
    ) {
      moveTask(task, over.id);
    }
  }

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
        Loading board...
      </div>
    );

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Kanban"
        description={
          isStakeholder
            ? "Read-only board view across projects."
            : "Drag tasks between columns to update their status."
        }
        action={
          canCreate && (
            <Button icon={Plus} onClick={() => navigate("/tasks/new")}>
              New task
            </Button>
          )
        }
      />
      {isStakeholder && (
        <div
          style={{
            background: "#fef3c7",
            border: "1px solid #fde68a",
            color: "#92400e",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          <strong>Stakeholder View:</strong> You have read-only visibility. Task
          card dragging and status changes are disabled.
        </div>
      )}
      <ProjectError message={error} />
      {items.length === 0 ? (
        <Card>
          <EmptyState
            title="No tasks yet"
            description="Create a task to start using your board."
            action={
              canCreate && (
                <Button onClick={() => navigate("/tasks/new")}>
                  Create task
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="kanban-board">
            {columns.map(([status, label]) => (
              <KanbanColumn
                key={status}
                status={status}
                label={label}
                tasks={items.filter((task) => task.status === status)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <KanbanCard task={activeTask} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </>
  );
}

function IssuesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ status: "", severity: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isStakeholder = user?.role === "STAKEHOLDER";
  const canDelete =
    user?.role === "ORGANISATION_ADMIN" || user?.role === "PROJECT_MANAGER";

  async function loadIssues() {
    setLoading(true);
    try {
      const { data } = await api.get("/issues", {
        params: {
          status: filters.status || undefined,
          severity: filters.severity || undefined,
        },
      });
      setItems(data.issues || []);
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load issues.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIssues();
  }, [filters.status, filters.severity]);

  async function deleteIssue(id) {
    if (!window.confirm("Delete this issue?")) return;
    try {
      await api.delete(`/issues/${id}`);
      setItems((current) => current.filter((issue) => issue._id !== id));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to delete issue.",
      );
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Issues"
        description={
          isStakeholder
            ? "Read-only issue tracker."
            : "Resolve blockers before they slow your team down."
        }
        action={
          !isStakeholder && (
            <Button
              variant="danger"
              icon={Plus}
              onClick={() => navigate("/issues/new")}
            >
              Report issue
            </Button>
          )
        }
      />
      <div className="toolbar">
        <select
          value={filters.status}
          onChange={(event) =>
            setFilters({ ...filters, status: event.target.value })
          }
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select
          value={filters.severity}
          onChange={(event) =>
            setFilters({ ...filters, severity: event.target.value })
          }
        >
          <option value="">All severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>
      <ProjectError message={error} />
      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          Loading issues...
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            title="No issues found"
            description="Report an issue when something needs attention."
            action={
              !isStakeholder && (
                <Button
                  variant="danger"
                  onClick={() => navigate("/issues/new")}
                >
                  Report issue
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <Card className="table-card">
          <div className="data-table">
            <div className="table-row issue-head">
              <span>Issue</span>
              <span>Project</span>
              <span>Reported by</span>
              <span>Assignee</span>
              <span>Severity</span>
              <span>Status</span>
            </div>
            {items.map((issue) => (
              <div className="table-row" key={issue._id}>
                <span className="task-title">
                  <span className="issue-marker">
                    <CircleAlert size={15} />
                  </span>
                  <Link to={`/issues/${issue._id}`}>
                    <strong>{issue.title}</strong>
                  </Link>
                </span>
                <span>{issue.project?.name}</span>
                <span>{issue.reportedBy?.name}</span>
                <span>{issue.assignedTo?.name || "Unassigned"}</span>
                <span>
                  <Badge tone={issue.severity}>{issue.severity}</Badge>
                </span>
                <span>
                  <Badge tone={issue.status}>
                    {issue.status.replace("_", " ")}
                  </Badge>
                </span>
                {canDelete && (
                  <button
                    className="more-button"
                    onClick={() => deleteIssue(issue._id)}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

function IssueForm({ edit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projectsList, setProjectsList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    project: "",
    task: "",
    assignedTo: "",
    severity: "MEDIUM",
    status: "OPEN",
  });
  const [loading, setLoading] = useState(edit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/projects"),
      api.get("/tasks"),
      edit ? api.get(`/issues/${id}`) : Promise.resolve(null),
    ])
      .then(([projectsResponse, tasksResponse, issueResponse]) => {
        setProjectsList(
          projectsResponse.data.myProjects ||
            projectsResponse.data.projects ||
            [],
        );
        setTasksList(tasksResponse.data.tasks || []);
        if (issueResponse) {
          const issue = issueResponse.data.issue;
          setForm({
            title: issue.title,
            description: issue.description || "",
            project: issue.project?._id,
            task: issue.task?._id || "",
            assignedTo: issue.assignedTo?._id || "",
            severity: issue.severity,
            status: issue.status,
          });
        }
      })
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Unable to load issue form.",
        ),
      )
      .finally(() => setLoading(false));
  }, [edit, id]);

  const selectedProject = projectsList.find(
    (project) => project._id === form.project,
  );
  const projectTasks = tasksList.filter(
    (task) => task.project?._id === form.project,
  );

  const eligibleAssignees = useMemo(() => {
    if (!selectedProject) return [];
    const list = [];
    if (selectedProject.manager) list.push(selectedProject.manager);
    if (selectedProject.teamLead) list.push(selectedProject.teamLead);
    if (Array.isArray(selectedProject.members))
      list.push(...selectedProject.members);
    const seen = new Set();
    return list.filter((item) => {
      const uId = (item?._id || item)?.toString();
      if (!uId || seen.has(uId)) return false;
      seen.add(uId);
      return true;
    });
  }, [selectedProject]);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      task: form.task || undefined,
      assignedTo: form.assignedTo || undefined,
    };
    try {
      const response = edit
        ? await api.put(`/issues/${id}`, payload)
        : await api.post("/issues", payload);
      navigate(`/issues/${response.data.issue._id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save issue.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
        Loading issue...
      </div>
    );

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title={edit ? "Edit issue" : "Report an issue"}
        description="Capture a blocker so the right person can resolve it."
      />
      <Card className="form-card">
        <form onSubmit={submit}>
          <label>
            Title
            <input
              name="title"
              value={form.title}
              onChange={update}
              required
              placeholder="Issue title"
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              rows="4"
              placeholder="Describe the issue"
            />
          </label>
          <label>
            Project
            <select
              name="project"
              value={form.project}
              onChange={(event) =>
                setForm({
                  ...form,
                  project: event.target.value,
                  task: "",
                  assignedTo: "",
                })
              }
              required
            >
              <option value="">Select project</option>
              {projectsList.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Related task
            <select name="task" value={form.task} onChange={update}>
              <option value="">No related task</option>
              {projectTasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Assigned member
            <select name="assignedTo" value={form.assignedTo} onChange={update}>
              <option value="">Unassigned</option>
              {eligibleAssignees.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} (
                  {ROLE_LABELS[member.role] || member.role || "Member"})
                </option>
              ))}
            </select>
          </label>
          <div className="form-row">
            <label>
              Priority / Severity
              <select name="severity" value={form.severity} onChange={update}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={update}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </label>
          </div>
          <ProjectError message={error} />
          <Button type="submit" variant="danger" disabled={saving}>
            {saving ? "Saving..." : edit ? "Save changes" : "Report issue"}
          </Button>
        </form>
      </Card>
    </>
  );
}

function IssueDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get(`/issues/${id}`)
      .then(({ data }) => setIssue(data.issue))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Unable to load issue.",
        ),
      );
  }, [id]);
  async function deleteIssue() {
    if (!window.confirm("Delete this issue?")) return;
    try {
      await api.delete(`/issues/${id}`);
      navigate("/issues");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to delete issue.",
      );
    }
  }
  if (!issue)
    return error ? (
      <ProjectError message={error} />
    ) : (
      <div className="loading-screen">
        <div className="spinner" />
        Loading issue...
      </div>
    );
  const canManage = user?.role === "PROJECT_MANAGER";
  return (
    <>
      <PageHeader
        eyebrow="Issue details"
        title={issue.title}
        description={issue.description || "No description provided."}
        action={
          <div className="hero-actions">
            {canManage && (
              <Link
                to={`/issues/${id}/edit`}
                className="button button-secondary"
              >
                Edit issue
              </Link>
            )}
            {canManage && (
              <Button variant="danger" onClick={deleteIssue}>
                Delete
              </Button>
            )}
          </div>
        }
      />
      <Card className="detail-card">
        <div className="section-heading">
          <h2>Issue information</h2>
          <Badge tone={issue.status}>{issue.status.replace("_", " ")}</Badge>
        </div>
        <div className="project-meta">
          <span>Project: {issue.project?.name}</span>
          <span>Severity: {issue.severity}</span>
          <span>Reported by: {issue.reportedBy?.name}</span>
          <span>Assigned to: {issue.assignedTo?.name || "Unassigned"}</span>
          {issue.task && <span>Task: {issue.task.title}</span>}
        </div>
      </Card>
    </>
  );
}

function ReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("this-month");

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/reports", { params: { period } });
        setReports(data.reports);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load reports.",
        );
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [period]);

  function periodControl() {
    return (
      <select
        className="report-period-select"
        value={period}
        onChange={(event) => setPeriod(event.target.value)}
        aria-label="Report period"
      >
        <option value="this-month">This month</option>
        <option value="last-month">Last month</option>
        <option value="all-time">All time</option>
      </select>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader
          eyebrow="Insights"
          title="Reports"
          description="A clear view of progress across your workspace."
          action={periodControl()}
        />
        <div className="loading-screen">
          <div className="spinner" />
          Loading reports...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          eyebrow="Insights"
          title="Reports"
          description="A clear view of progress across your workspace."
          action={periodControl()}
        />
        <ProjectError message={error} />
      </>
    );
  }

  if (!reports) {
    return (
      <>
        <PageHeader
          eyebrow="Insights"
          title="Reports"
          description="A clear view of progress across your workspace."
          action={periodControl()}
        />
        <Card>
          <EmptyState
            title="No data available"
            description="Create projects, tasks, and issues to see insights here."
          />
        </Card>
      </>
    );
  }

  const { projects, tasks, issues, projectProgress } = reports;

  const taskStatusData = [
    { name: "To do", value: tasks.todo },
    { name: "In progress", value: tasks.inProgress },
    { name: "Completed", value: tasks.completed },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description="A clear view of progress across your workspace."
        action={periodControl()}
      />
      <div className="stat-grid compact-stats">
        {[
          ["Total projects", projects.total, "/projects"],
          ["Active projects", projects.active, "/projects?status=ACTIVE"],
          [
            "Completed projects",
            projects.completed,
            "/projects?status=COMPLETED",
          ],
          ["Total tasks", tasks.total, "/tasks"],
          ["To do", tasks.todo, "/tasks?status=TODO"],
          ["In progress", tasks.inProgress, "/tasks?status=IN_PROGRESS"],
          ["Completed tasks", tasks.completed, "/tasks?status=COMPLETED"],
          ["Total issues", issues.total, "/issues"],
          ["Open issues", issues.open, "/issues?status=OPEN"],
          ["Resolved issues", issues.resolved, "/issues?status=RESOLVED"],
        ].map(([label, value, href]) => (
          <Card className="mini-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <div className="mini-stat-footer">
              <small>Across all projects</small>
              <Link to={href} className="mini-stat-link">
                View
                <ArrowRight size={13} />
              </Link>
            </div>
          </Card>
        ))}
      </div>
      <div className="report-grid">
        <Card>
          <div className="section-heading">
            <div>
              <h2>Tasks by status</h2>
              <p>Workload distribution</p>
            </div>
          </div>
          <div className="report-chart-frame">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={taskStatusData}
                margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e8ebf0"
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#5966d8" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="report-chart-card">
          <div className="section-heading">
            <div>
              <h2>Tasks by priority</h2>
              <p>Where attention is needed</p>
            </div>
          </div>
          <div className="donut-chart">
            <div className="donut-visual">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasks.byPriority}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={4}
                  >
                    {tasks.byPriority.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="legend">
              {tasks.byPriority.map((item) => (
                <span key={item.name}>
                  <i style={{ background: item.color }} />
                  {item.name}
                  <strong>{item.value}</strong>
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <Card className="report-chart-card">
        <div className="section-heading">
          <div>
            <h2>Issues by severity</h2>
            <p>Issues requiring attention</p>
          </div>
        </div>
        <div className="donut-chart">
          <div className="donut-visual">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issues.bySeverity}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={4}
                >
                  {issues.bySeverity.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">
            {issues.bySeverity.map((item) => (
              <span key={item.name}>
                <i style={{ background: item.color }} />
                {item.name}
                <strong>{item.value}</strong>
              </span>
            ))}
          </div>
        </div>
      </Card>
      <Card className="report-progress-card">
        <div className="section-heading">
          <div>
            <h2>Project progress</h2>
            <p>Completion across active projects</p>
          </div>
        </div>
        <div className="report-projects">
          {projectProgress.length > 0 ? (
            projectProgress.map((project) => (
              <div key={project.name}>
                <div>
                  <strong>{project.name}</strong>
                  <span>{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} />
                <small>{project.status}</small>
              </div>
            ))
          ) : (
            <EmptyState
              title="No projects yet"
              description="Create a project to track progress."
            />
          )}
        </div>
      </Card>
    </>
  );
}

function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterRole, setFilterRole] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "MEMBER",
  });
  const [inviting, setInviting] = useState(false);

  const isOrgAdmin = user?.role === "ORGANISATION_ADMIN";

  async function loadTeam() {
    setLoading(true);
    setError("");
    try {
      const [usersResponse, tasksResponse, projectsResponse] =
        await Promise.all([
          api.get("/users"),
          api.get("/tasks"),
          api.get("/projects"),
        ]);
      setMembers(usersResponse.data.users || []);
      setTasks(tasksResponse.data.tasks || []);
      setProjects(
        projectsResponse.data.myProjects ||
          projectsResponse.data.projects ||
          [],
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load team.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeam();
  }, []);

  async function handleRoleChange(userId, newRole) {
    setError("");
    setSuccess("");
    try {
      const res = await api.patch(`/users/${userId}/role`, {
        role: newRole,
      });
      setMembers((current) =>
        current.map((m) => (m._id === userId ? { ...m, role: newRole } : m)),
      );
      setSuccess(res.data.message || "User role updated.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to change user role.",
      );
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setInviting(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/users/invite", inviteForm);
      setMembers((current) => [...current, res.data.user]);
      setShowInviteModal(false);
      setInviteForm({ name: "", email: "", password: "", role: "MEMBER" });
      setSuccess(res.data.message || "User invited successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to invite user.",
      );
    } finally {
      setInviting(false);
    }
  }

  function countMemberTasks(memberId) {
    return tasks.filter(
      (task) => (task.assignedTo?._id || task.assignedTo) === memberId,
    ).length;
  }

  function countMemberProjects(memberId) {
    return projects.filter(
      (project) =>
        (project.manager?._id || project.manager) === memberId ||
        (project.teamLead?._id || project.teamLead) === memberId ||
        project.members?.some(
          (member) => (member._id || member) === memberId,
        ) ||
        project.stakeholders?.some((s) => (s._id || s) === memberId),
    ).length;
  }

  const roleBadgeTone = {
    ORGANISATION_ADMIN: "active",
    PROJECT_MANAGER: "active",
    TEAM_LEAD: "progress",
    MEMBER: "neutral",
    STAKEHOLDER: "planned",
  };

  const filteredMembers =
    filterRole === "ALL"
      ? members
      : members.filter((m) => m.role === filterRole);

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
        Loading team...
      </div>
    );

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Team & Roles"
        description="Workspace member directory and role management."
        action={
          isOrgAdmin && (
            <Button icon={Plus} onClick={() => setShowInviteModal(true)}>
              Invite user
            </Button>
          )
        }
      />
      {success && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          {success}
        </div>
      )}
      <ProjectError message={error} />

      <div className="toolbar" style={{ flexWrap: "wrap", gap: 8 }}>
        {[
          ["ALL", "All Members"],
          ["ORGANISATION_ADMIN", "Admins"],
          ["PROJECT_MANAGER", "Project Managers"],
          ["TEAM_LEAD", "Team Leads"],
          ["MEMBER", "Developers / Members"],
          ["STAKEHOLDER", "Stakeholders"],
        ].map(([r, label]) => (
          <Button
            key={r}
            variant={filterRole === r ? "primary" : "secondary"}
            onClick={() => setFilterRole(r)}
          >
            {label}
          </Button>
        ))}
      </div>

      {showInviteModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 440,
              background: "#fff",
              padding: 24,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18 }}>Invite Workspace User</h3>
              <button
                className="more-button"
                onClick={() => setShowInviteModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleInvite}>
              <label>
                Full name
                <input
                  required
                  value={inviteForm.name}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, name: e.target.value })
                  }
                  placeholder="Full name"
                />
              </label>
              <label>
                Email address
                <input
                  required
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  placeholder="email@company.com"
                />
              </label>
              <label>
                Temporary password
                <input
                  required
                  type="password"
                  value={inviteForm.password}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, password: e.target.value })
                  }
                  placeholder="Min 6 characters"
                />
              </label>
              <label>
                Assigned role
                <select
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, role: e.target.value })
                  }
                >
                  <option value="ORGANISATION_ADMIN">Organisation Admin</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="TEAM_LEAD">Team Lead</option>
                  <option value="MEMBER">Developer / Member</option>
                  <option value="STAKEHOLDER">Stakeholder</option>
                </select>
              </label>
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={inviting}>
                  {inviting ? "Creating..." : "Invite user"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredMembers.length === 0 ? (
        <Card>
          <EmptyState
            title="No members found"
            description="No users match this filter."
          />
        </Card>
      ) : (
        <div className="member-grid">
          {filteredMembers.map((member) => (
            <Card className="member-card" key={member._id || member.email}>
              <Avatar name={member.name} size="lg" />
              <h2>{member.name}</h2>
              <p>{member.email}</p>
              <div style={{ margin: "8px 0" }}>
                <Badge tone={roleBadgeTone[member.role] || "neutral"}>
                  {ROLE_LABELS[member.role] || member.role}
                </Badge>
              </div>

              {isOrgAdmin && (
                <div style={{ marginTop: 8, textAlign: "left", width: "100%" }}>
                  <label style={{ fontSize: 11, color: "#64748b" }}>
                    Change role:
                    <select
                      className="inline-select"
                      style={{ width: "100%", marginTop: 4 }}
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member._id, e.target.value)
                      }
                    >
                      <option value="ORGANISATION_ADMIN">
                        Organisation Admin
                      </option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="TEAM_LEAD">Team Lead</option>
                      <option value="MEMBER">Developer / Member</option>
                      <option value="STAKEHOLDER">Stakeholder</option>
                    </select>
                  </label>
                </div>
              )}

              <div className="member-stats">
                <span>
                  <strong>{countMemberTasks(member._id)}</strong> tasks
                </span>
                <span>
                  <strong>{countMemberProjects(member._id)}</strong> projects
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    avatar: user?.avatar || "",
  });

  useEffect(() => {
    setForm({ name: user?.name || "", avatar: user?.avatar || "" });
  }, [user]);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function cancelEditing() {
    setForm({ name: user?.name || "", avatar: user?.avatar || "" });
    setError("");
    setEditing(false);
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProfile({ name: form.name, avatar: form.avatar });
      setEditing(false);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Your account details and workspace role."
        action={
          !editing && (
            <Button
              variant="secondary"
              icon={Pencil}
              onClick={() => {
                setError("");
                setEditing(true);
              }}
            >
              Edit profile
            </Button>
          )
        }
      />
      <Card className="profile-card">
        {editing ? (
          <form className="profile-edit-form" onSubmit={saveProfile}>
            <Avatar
              name={form.name || "Workspace user"}
              avatar={form.avatar}
              size="xl"
            />
            <label>
              Name
              <input name="name" value={form.name} onChange={update} required />
            </label>
            <label>
              Email
              <input value={user?.email || ""} readOnly disabled />
              <small>Email cannot be changed.</small>
            </label>
            <label>
              Avatar URL
              <input
                name="avatar"
                value={form.avatar}
                onChange={update}
                placeholder="https://example.com/avatar.png"
              />
            </label>
            {error && <ProjectError message={error} />}
            <div className="form-actions">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save profile"}
              </Button>
              <Button type="button" variant="secondary" onClick={cancelEditing}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <Avatar
              name={user?.name || "Workspace user"}
              avatar={user?.avatar}
              size="xl"
            />
            <div>
              <div className="eyebrow">Personal profile</div>
              <h2>{user?.name || "Workspace user"}</h2>
              <p>{user?.email || "No email available"}</p>
              <div style={{ marginTop: 8 }}>
                <Badge tone="active">
                  {ROLE_LABELS[user?.role] || user?.role || "Member"}
                </Badge>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
                {ROLE_DESCRIPTIONS[user?.role]}
              </div>
            </div>
          </>
        )}
      </Card>
    </>
  );
}

function ProjectForm({ edit = false }) {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    deadline: "",
    status: "PLANNED",
    manager: "",
    teamLead: "",
    members: [],
    stakeholders: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isOrgAdmin = user?.role === "ORGANISATION_ADMIN";
  const memberCandidates = usersList.filter(
    (candidate) =>
      candidate.role === "MEMBER" || candidate.role === "TEAM_LEAD",
  );
  const stakeholderCandidates = usersList.filter(
    (candidate) => candidate.role === "STAKEHOLDER",
  );

  useEffect(() => {
    Promise.all([
      api.get("/users"),
      edit ? api.get(`/projects/${id}`) : Promise.resolve(null),
    ])
      .then(([usersRes, projectRes]) => {
        const allUsers = usersRes.data.users || [];
        setUsersList(allUsers);
        if (projectRes) {
          const project = projectRes.data.project;
          setForm({
            name: project.name || "",
            description: project.description || "",
            startDate: project.startDate?.slice(0, 10) || "",
            deadline: project.deadline?.slice(0, 10) || "",
            status: project.status || "PLANNED",
            manager: (
              project.manager?._id ||
              project.manager ||
              ""
            )?.toString(),
            teamLead: (
              project.teamLead?._id ||
              project.teamLead ||
              ""
            )?.toString(),
            members: (project.members || []).map((m) =>
              (m._id || m).toString(),
            ),
            stakeholders: (project.stakeholders || []).map((s) =>
              (s._id || s).toString(),
            ),
          });
        } else {
          setForm((prev) => ({
            ...prev,
            manager: user?.id || "",
          }));
        }
      })
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message ||
            "Unable to load project form.",
        ),
      )
      .finally(() => setLoading(false));
  }, [edit, id, user]);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function toggleMember(userId) {
    const strId = userId.toString();
    setForm((prev) => {
      const exists = prev.members.includes(strId);
      const nextMembers = exists
        ? prev.members.filter((m) => m !== strId)
        : [...prev.members, strId];
      const nextStakeholders = prev.stakeholders.filter((s) => s !== strId);
      return { ...prev, members: nextMembers, stakeholders: nextStakeholders };
    });
  }

  function toggleStakeholder(userId) {
    const strId = userId.toString();
    setForm((prev) => {
      const exists = prev.stakeholders.includes(strId);
      const nextStakeholders = exists
        ? prev.stakeholders.filter((s) => s !== strId)
        : [...prev.stakeholders, strId];
      const nextMembers = prev.members.filter((m) => m !== strId);
      return { ...prev, stakeholders: nextStakeholders, members: nextMembers };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        deadline: form.deadline,
        status: form.status,
        manager: isOrgAdmin && form.manager ? form.manager : undefined,
        teamLead: form.teamLead || null,
        members: form.members,
        stakeholders: form.stakeholders,
      };
      const response = edit
        ? await api.put(`/projects/${id}`, payload)
        : await api.post("/projects", payload);
      navigate(`/projects/${response.data.project._id}`);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to save project.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
        Loading project...
      </div>
    );

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title={edit ? "Edit project" : "New project"}
        description={
          edit
            ? "Update project details and participant roles."
            : "Set up a clear home for your next initiative and assign project roles."
        }
      />
      <Card className="form-card">
        <form onSubmit={submit}>
          <label>
            Project name
            <input
              name="name"
              value={form.name}
              onChange={update}
              required
              placeholder="e.g. Modern Mobile App"
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              rows="3"
              placeholder="Add context on project scope"
            />
          </label>
          <div className="form-row">
            <label>
              Start date
              <input
                name="startDate"
                value={form.startDate}
                onChange={update}
                type="date"
                required
              />
            </label>
            <label>
              Deadline
              <input
                name="deadline"
                value={form.deadline}
                onChange={update}
                type="date"
                required
              />
            </label>
          </div>
          <label>
            Status
            <select name="status" value={form.status} onChange={update}>
              <option value="PLANNED">Planned</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>

          <label>
            Project Manager
            {isOrgAdmin ? (
              <select
                name="manager"
                value={form.manager}
                onChange={update}
                required
              >
                <option value="">Select project manager</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({ROLE_LABELS[u.role] || u.role})
                  </option>
                ))}
              </select>
            ) : (
              <input disabled value={`${user?.name} (You — Project Manager)`} />
            )}
          </label>

          <label>
            Team Lead (Optional)
            <select name="teamLead" value={form.teamLead} onChange={update}>
              <option value="">None (Unassigned)</option>
              {usersList.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({ROLE_LABELS[u.role] || u.role})
                </option>
              ))}
            </select>
          </label>

          <div className="assignment-grid">
            <div className="assignment-panel">
              <strong>Assign Project Members (Developers):</strong>
              <p className="assignment-help">
                Members work on tasks, log progress, and report issues.
              </p>
              <div className="assignment-list">
                {memberCandidates.length === 0 ? (
                  <span className="assignment-empty">
                    No developers available.
                  </span>
                ) : (
                  memberCandidates.map((candidate) => (
                    <label className="assignment-option" key={candidate._id}>
                      <input
                        type="checkbox"
                        checked={form.members.includes(candidate._id)}
                        onChange={() => toggleMember(candidate._id)}
                      />
                      <span className="assignment-person">
                        <Avatar
                          name={candidate.name}
                          avatar={candidate.avatar}
                          size="xs"
                        />
                        <span className="assignment-name">
                          {candidate.name}
                        </span>
                      </span>
                      <small>
                        {ROLE_LABELS[candidate.role] || candidate.role}
                      </small>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="assignment-panel">
              <strong>Assign Stakeholders (Read-only viewers):</strong>
              <p className="assignment-help">
                Stakeholders have read-only visibility into progress,
                milestones, and reports.
              </p>
              <div className="assignment-list">
                {stakeholderCandidates.length === 0 ? (
                  <span className="assignment-empty">
                    No stakeholders available.
                  </span>
                ) : (
                  stakeholderCandidates.map((candidate) => (
                    <label className="assignment-option" key={candidate._id}>
                      <input
                        type="checkbox"
                        checked={form.stakeholders.includes(candidate._id)}
                        onChange={() => toggleStakeholder(candidate._id)}
                      />
                      <span className="assignment-person">
                        <Avatar
                          name={candidate.name}
                          avatar={candidate.avatar}
                          size="xs"
                        />
                        <span className="assignment-name">
                          {candidate.name}
                        </span>
                      </span>
                      <small>Stakeholder</small>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <ProjectError message={error} />
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : edit ? "Save changes" : "Create project"}
          </Button>
        </form>
      </Card>
    </>
  );
}

function FormPage({ title, description }) {
  return (
    <>
      <PageHeader eyebrow="Workspace" title={title} description={description} />
      <Card className="form-card">
        <label>
          Name
          <input placeholder="Enter a name" />
        </label>
        <label>
          Description
          <textarea placeholder="Add a short description" rows="4" />
        </label>
        <div className="form-row">
          <label>
            Start date
            <input type="date" />
          </label>
          <label>
            Deadline
            <input type="date" />
          </label>
        </div>
        <Button>Save draft</Button>
      </Card>
    </>
  );
}

function MilestoneForm({ projectId, initialData, onSubmit, onCancel }) {
  const edit = !!initialData;
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    dueDate: initialData?.dueDate ? initialData.dueDate.slice(0, 10) : "",
    status: initialData?.status || "PLANNED",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(edit);

  if (edit) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="milestone-form"
      >
        <div className="form-row">
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Milestone name"
            />
          </label>
          <label>
            Due date
            <input
              name="dueDate"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              type="date"
              required
            />
          </label>
        </div>
        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows="2"
            placeholder="Add a short description"
          />
        </label>
        <label>
          Status
          <select
            name="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </label>
        {error && (
          <div className="form-error">
            <XCircle size={16} />
            {error}
          </div>
        )}
        <div className="form-actions">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  if (!showForm) {
    return (
      <Button icon={Plus} onClick={() => setShowForm(true)}>
        Create milestone
      </Button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="milestone-form"
    >
      <div className="form-row">
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Milestone name"
            autoFocus
          />
        </label>
        <label>
          Due date
          <input
            name="dueDate"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            type="date"
            required
          />
        </label>
      </div>
      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows="2"
          placeholder="Add a short description"
        />
      </label>
      <label>
        Status
        <select
          name="status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="PLANNED">Planned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </label>
      {error && (
        <div className="form-error">
          <XCircle size={16} />
          {error}
        </div>
      )}
      <div className="form-actions">
        <Button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create milestone"}
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            setShowForm(false);
            setForm({
              name: "",
              description: "",
              dueDate: "",
              status: "PLANNED",
            });
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [email, setEmail] = useState("");
  const [roleInProject, setRoleInProject] = useState("MEMBER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [milestonesLoading, setMilestonesLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/projects/${id}`)
      .then(({ data }) => {
        setProject(data.project);
        setReadOnly(Boolean(data.readOnly));
      })
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Unable to load project.",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !project || readOnly) {
      setMilestones([]);
      setMilestonesLoading(false);
      return;
    }
    setMilestonesLoading(true);
    api
      .get(`/projects/${id}/milestones`)
      .then(({ data }) => setMilestones(data.milestones || []))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Unable to load milestones.",
        ),
      )
      .finally(() => setMilestonesLoading(false));
  }, [id, project, readOnly]);

  async function addMember(event) {
    event.preventDefault();
    try {
      const { data } = await api.post(`/projects/${id}/members`, {
        email,
        roleInProject,
      });
      setProject(data.project);
      setEmail("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to add member.");
    }
  }

  async function removeMember(memberId) {
    try {
      const { data } = await api.delete(`/projects/${id}/members/${memberId}`);
      setProject(data.project);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to remove member.",
      );
    }
  }

  async function createMilestone(milestoneData) {
    try {
      const { data } = await api.post(`/projects/${id}/milestones`, {
        ...milestoneData,
        project: id,
      });
      setMilestones((current) =>
        [...current, data.milestone].sort(
          (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to create milestone.",
      );
      throw requestError;
    }
  }

  async function updateMilestone(milestoneId, milestoneData) {
    try {
      const { data } = await api.put(
        `/projects/${id}/milestones/${milestoneId}`,
        milestoneData,
      );
      setMilestones((current) =>
        current
          .map((m) => (m._id === milestoneId ? data.milestone : m))
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update milestone.",
      );
      throw requestError;
    }
  }

  async function deleteMilestone(milestoneId) {
    if (!window.confirm("Delete this milestone?")) return;
    try {
      await api.delete(`/projects/${id}/milestones/${milestoneId}`);
      setMilestones((current) => current.filter((m) => m._id !== milestoneId));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to delete milestone.",
      );
    }
  }

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
        Loading project...
      </div>
    );
  if (!project) return <ProjectError message={error || "Project not found."} />;

  const canManage =
    user?.role === "ORGANISATION_ADMIN" ||
    (user?.role === "PROJECT_MANAGER" &&
      ((project.manager?._id || project.manager) === user?.id ||
        (project.manager?._id || project.manager) === user?._id));
  const currentUserId = user?.id || user?._id;
  const isParticipant = [
    project.manager,
    project.teamLead,
    ...(project.members || []),
    ...(project.stakeholders || []),
  ].some(
    (participant) =>
      (participant?._id || participant)?.toString() === currentUserId,
  );
  const isReadOnlyViewer = !canManage && !isParticipant;

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }

  function getStatusBadgeTone(status) {
    switch (status) {
      case "COMPLETED":
        return "completed";
      case "IN_PROGRESS":
        return "active";
      default:
        return "planned";
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Project overview"
        title={project.name}
        description={project.description || "No description provided."}
        action={
          canManage && (
            <Link
              to={`/projects/${id}/edit`}
              className="button button-secondary"
            >
              Edit project
            </Link>
          )
        }
      />
      <ProjectError message={error} />
      {isReadOnlyViewer && (
        <div className="read-only-notice">
          <strong>Read-only project view.</strong> You can review this active
          project, its participants, and milestones, but you are not assigned to
          its team.
        </div>
      )}
      <div className="detail-grid">
        <Card>
          <div className="section-heading">
            <h2>Overview</h2>
            <Badge tone={project.status}>{project.status}</Badge>
          </div>
          <p className="detail-copy">
            Created {new Date(project.createdAt).toLocaleDateString()} · Managed
            by {project.manager?.name || "Unknown"}
          </p>
          <div className="detail-progress">
            <div>
              <span>Progress</span>
              <strong>{project.progress ?? 0}%</strong>
            </div>
            <ProgressBar
              value={
                project.progress ??
                (project.status === "COMPLETED"
                  ? 100
                  : project.status === "ACTIVE"
                    ? 50
                    : 0)
              }
            />
          </div>
          <div style={{ marginTop: 14, fontSize: 13, color: "#64748b" }}>
            <span>
              Start date: {new Date(project.startDate).toLocaleDateString()}
            </span>{" "}
            ·{" "}
            <span>
              Deadline: {new Date(project.deadline).toLocaleDateString()}
            </span>
          </div>
        </Card>

        {/* Project Participants */}
        <Card>
          <div className="section-heading">
            <h2>Project Participants</h2>
            <Users size={18} />
          </div>

          {canManage && (
            <form
              className="member-form"
              onSubmit={addMember}
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                placeholder="user@example.com"
                style={{ flex: 1, minWidth: 160 }}
              />
              <select
                value={roleInProject}
                onChange={(e) => setRoleInProject(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                }}
              >
                <option value="MEMBER">Member (Developer)</option>
                <option value="TEAM_LEAD">Team Lead</option>
                <option value="STAKEHOLDER">Stakeholder</option>
              </select>
              <Button type="submit">Add</Button>
            </form>
          )}

          <div className="activity-list">
            {project.manager && (
              <div className="activity-row" key="pm">
                <Avatar name={project.manager.name} size="sm" />
                <div style={{ flex: 1 }}>
                  <strong>{project.manager.name}</strong>
                  <small>{project.manager.email}</small>
                </div>
                <Badge tone="active">Project Manager</Badge>
              </div>
            )}

            {project.teamLead && (
              <div className="activity-row" key="tl">
                <Avatar name={project.teamLead.name} size="sm" />
                <div style={{ flex: 1 }}>
                  <strong>{project.teamLead.name}</strong>
                  <small>{project.teamLead.email}</small>
                </div>
                <Badge tone="progress">Team Lead</Badge>
                {canManage && (
                  <button
                    className="more-button"
                    onClick={() => removeMember(project.teamLead._id)}
                    title="Remove team lead"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            )}

            {project.members?.map((member) => (
              <div className="activity-row" key={member._id}>
                <Avatar name={member.name} size="sm" />
                <div style={{ flex: 1 }}>
                  <strong>{member.name}</strong>
                  <small>{member.email}</small>
                </div>
                <Badge tone="neutral">Member</Badge>
                {canManage && member._id !== project.manager?._id && (
                  <button
                    className="more-button"
                    onClick={() => removeMember(member._id)}
                    title="Remove member"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}

            {project.stakeholders?.map((stakeholder) => (
              <div className="activity-row" key={stakeholder._id}>
                <Avatar name={stakeholder.name} size="sm" />
                <div style={{ flex: 1 }}>
                  <strong>{stakeholder.name}</strong>
                  <small>{stakeholder.email}</small>
                </div>
                <Badge tone="planned">Stakeholder</Badge>
                {canManage && (
                  <button
                    className="more-button"
                    onClick={() => removeMember(stakeholder._id)}
                    title="Remove stakeholder"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Milestones Card */}
        <Card>
          <div className="section-heading">
            <div className="section-heading-main">
              <h2>Milestones</h2>
              <Target size={18} />
            </div>
            {canManage && (
              <div className="section-heading-actions">
                <MilestoneForm
                  projectId={id}
                  onSubmit={createMilestone}
                  onCancel={() => {}}
                />
              </div>
            )}
          </div>
          {milestonesLoading ? (
            <div className="loading-screen">
              <div className="spinner" />
              Loading milestones...
            </div>
          ) : milestones.length === 0 ? (
            <EmptyState
              title="No milestones yet"
              description={
                canManage
                  ? "Create a milestone to track key project deliverables."
                  : "This project has no milestones yet."
              }
            />
          ) : (
            <div className="milestone-list">
              {milestones.map((milestone) => (
                <div className="milestone-item" key={milestone._id}>
                  <div className="milestone-main">
                    <div className="milestone-header">
                      <strong>{milestone.name}</strong>
                      <Badge tone={getStatusBadgeTone(milestone.status)}>
                        {milestone.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="milestone-description">
                      {milestone.description || "No description"}
                    </p>
                    <div className="milestone-meta">
                      <span>
                        <CalendarDays size={14} /> Due:{" "}
                        {formatDate(milestone.dueDate)}
                      </span>
                      <span>
                        <Users size={14} /> Created by:{" "}
                        {milestone.createdBy?.name || "Unknown"}
                      </span>
                    </div>
                  </div>
                  {canManage && (
                    <div className="milestone-actions">
                      <MilestoneForm
                        projectId={id}
                        initialData={milestone}
                        onSubmit={(data) =>
                          updateMilestone(milestone._id, data)
                        }
                        onCancel={() => {}}
                      />
                      <button
                        className="more-button"
                        onClick={() => deleteMilestone(milestone._id)}
                        title="Delete milestone"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function SearchPage() {
  const location = useLocation();
  const initialQuery = useMemo(
    () => new URLSearchParams(location.search).get("q") || "",
    [location.search],
  );
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({
    projects: [],
    tasks: [],
    issues: [],
    users: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(nextQuery = query) {
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      setResults({ projects: [], tasks: [], issues: [], users: [] });
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/search", { params: { q: trimmed } });
      setResults({
        projects: response.data.projects || [],
        tasks: response.data.tasks || [],
        issues: response.data.issues || [],
        users: response.data.users || [],
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to search.");
      setResults({ projects: [], tasks: [], issues: [], users: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const hasResults =
    results.projects.length +
      results.tasks.length +
      results.issues.length +
      results.users.length >
    0;

  function renderProject(project) {
    return (
      <Link
        to={`/projects/${project._id}`}
        className="search-result-item"
        key={project._id}
      >
        <span className="result-type">Project</span>
        <div className="result-main">
          <strong>{project.name}</strong>
          <small>{project.description || "No description"}</small>
        </div>
        <Badge tone={project.status}>{project.status}</Badge>
      </Link>
    );
  }

  function renderTask(task) {
    return (
      <Link
        to={`/tasks/${task._id}`}
        className="search-result-item"
        key={task._id}
      >
        <span className="result-type">Task</span>
        <div className="result-main">
          <strong>{task.title}</strong>
          <small>
            {task.project?.name} · {task.assignedTo?.name}
          </small>
        </div>
        <Badge tone={task.priority}>{task.priority}</Badge>
      </Link>
    );
  }

  function renderIssue(issue) {
    return (
      <Link
        to={`/issues/${issue._id}`}
        className="search-result-item"
        key={issue._id}
      >
        <span className="result-type">Issue</span>
        <div className="result-main">
          <strong>{issue.title}</strong>
          <small>
            {issue.project?.name} · {issue.assignedTo?.name || "Unassigned"}
          </small>
        </div>
        <Badge tone={issue.severity}>{issue.severity}</Badge>
      </Link>
    );
  }

  function renderUser(user) {
    return (
      <div className="search-result-item" key={user._id}>
        <span className="result-type">Member</span>
        <div className="result-main">
          <strong>{user.name}</strong>
          <small>{user.email}</small>
        </div>
        <Badge tone={user.role === "PROJECT_MANAGER" ? "active" : "neutral"}>
          {user.role === "PROJECT_MANAGER" ? "Project Manager" : "Member"}
        </Badge>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Search"
        description="Find projects, tasks, issues, and people."
      />
      <Card className="search-page">
        <label className="search-field large">
          <Search size={19} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSearch()}
            placeholder="Search your workspace..."
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </label>

        {error && (
          <div className="form-error">
            <XCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            Searching...
          </div>
        ) : !query.trim() ? (
          <EmptyState
            title="Search your workspace"
            description="Enter a query to find anything across your projects."
          />
        ) : !hasResults ? (
          <EmptyState
            title="No results found"
            description={`No projects, tasks, issues, or members match "${query}".`}
          />
        ) : (
          <div className="search-results">
            {results.projects.length > 0 && (
              <div className="search-section">
                <h3>Projects ({results.projects.length})</h3>
                <div className="search-list">
                  {results.projects.map(renderProject)}
                </div>
              </div>
            )}
            {results.tasks.length > 0 && (
              <div className="search-section">
                <h3>Tasks ({results.tasks.length})</h3>
                <div className="search-list">
                  {results.tasks.map(renderTask)}
                </div>
              </div>
            )}
            {results.issues.length > 0 && (
              <div className="search-section">
                <h3>Issues ({results.issues.length})</h3>
                <div className="search-list">
                  {results.issues.map(renderIssue)}
                </div>
              </div>
            )}
            {results.users.length > 0 && (
              <div className="search-section">
                <h3>Members ({results.users.length})</h3>
                <div className="search-list">
                  {results.users.map(renderUser)}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </>
  );
}

function NotFound() {
  return (
    <div className="not-found">
      <XCircle size={42} />
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/dashboard" className="button button-primary">
        Back to dashboard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProjectForm />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/edit" element={<ProjectForm edit />} />
        <Route path="/projects/:id/activity" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/milestones" element={<MilestonesPage />} />
        <Route path="/projects/:id/sprints" element={<SprintsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/new" element={<TaskForm />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/tasks/:id/edit" element={<TaskForm edit />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route
          path="/team/new"
          element={
            <FormPage
              title="Invite a member"
              description="Bring another collaborator into your workspace."
            />
          }
        />
        <Route path="/team/:id" element={<TeamPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/issues/new" element={<IssueForm />} />
        <Route path="/issues/:id" element={<IssueDetailPage />} />
        <Route path="/issues/:id/edit" element={<IssueForm edit />} />
        <Route path="/milestones" element={<MilestonesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
