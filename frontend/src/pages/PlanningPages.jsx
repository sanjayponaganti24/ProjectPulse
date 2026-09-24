import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Flag,
  Zap,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  FolderKanban,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Badge,
  ProgressBar,
  Avatar,
  Button,
  LoadingState,
  ErrorState,
} from "../components/UI.jsx";
import api from "../services/api.js";

export function MilestonesPage() {
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [pRes, tRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks"),
        ]);
        setProjects(pRes.data.projects || []);
        setTasks(tRes.data.tasks || []);
      } catch (err) {
        setError("Failed to load milestone roadmap.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading)
    return <LoadingState message="Calculating roadmap milestones..." />;
  if (error) return <ErrorState message={error} />;

  const targetProjects = id ? projects.filter((p) => p._id === id) : projects;

  return (
    <div>
      <PageHeader
        eyebrow="Delivery Roadmap"
        title="Project Milestones"
        description="Key deliverable markers, architectural checkpoints, and release targets."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {targetProjects.map((p) => {
          const projTasks = tasks.filter(
            (t) => t.project?._id === p._id || t.project === p._id,
          );
          const completedCount = projTasks.filter(
            (t) => t.status === "COMPLETED",
          ).length;
          const pct = projTasks.length
            ? Math.round((completedCount / projTasks.length) * 100)
            : p.status === "COMPLETED"
              ? 100
              : 30;

          const milestones = [
            {
              name: "Architecture & Inception Spec",
              targetDate: new Date(
                new Date(p.startDate).getTime() + 10 * 24 * 60 * 60 * 1000,
              ).toLocaleDateString(),
              status: pct > 20 ? "COMPLETED" : "IN_PROGRESS",
              desc: "Technical specification, database schemas, and stakeholder sign-off.",
            },
            {
              name: "Core MVP Functionality",
              targetDate: new Date(
                new Date(p.startDate).getTime() + 30 * 24 * 60 * 60 * 1000,
              ).toLocaleDateString(),
              status:
                pct >= 60 ? "COMPLETED" : pct >= 20 ? "IN_PROGRESS" : "TODO",
              desc: "Primary user flows, API integrations, and internal dogfooding build.",
            },
            {
              name: "QA Hardening & Security Audit",
              targetDate: new Date(
                new Date(p.deadline).getTime() - 10 * 24 * 60 * 60 * 1000,
              ).toLocaleDateString(),
              status:
                pct >= 90 ? "COMPLETED" : pct >= 60 ? "IN_PROGRESS" : "TODO",
              desc: "End-to-end regression testing, penetration tests, and performance benchmarks.",
            },
            {
              name: "General Availability Release",
              targetDate: new Date(p.deadline).toLocaleDateString(),
              status: pct === 100 ? "COMPLETED" : "TODO",
              desc: "Production rollout, marketing launch, and customer documentation.",
            },
          ];

          return (
            <Card key={p._id}>
              <div className="card-header">
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <Badge tone={p.status}>{p.status}</Badge>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Managed by {p.manager?.name}
                    </span>
                  </div>
                  <Link
                    to={`/projects/${p._id}`}
                    className="card-title"
                    style={{ fontSize: 17 }}
                  >
                    {p.name}
                  </Link>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--primary)",
                    }}
                  >
                    {pct}% Complete
                  </span>
                  <div style={{ width: 120, marginTop: 4 }}>
                    <ProgressBar value={pct} />
                  </div>
                </div>
              </div>

              {/* Milestones timeline */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 14,
                  marginTop: 16,
                }}
              >
                {milestones.map((m, idx) => (
                  <div
                    key={m.name}
                    style={{
                      background: "var(--bg-app)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 10,
                      padding: 14,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--text-light)",
                        }}
                      >
                        PHASE {idx + 1}
                      </span>
                      <Badge tone={m.status}>{m.status}</Badge>
                    </div>
                    <strong style={{ fontSize: 13, color: "#0f172a" }}>
                      {m.name}
                    </strong>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        lineHeight: 1.4,
                        margin: 0,
                      }}
                    >
                      {m.desc}
                    </p>
                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: 6,
                        fontSize: 11,
                        color: "var(--text-light)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Calendar size={12} /> Target: {m.targetDate}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function SprintsPage() {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [tRes, pRes] = await Promise.all([
          api.get("/tasks"),
          api.get("/projects"),
        ]);
        setTasks(tRes.data.tasks || []);
        setProjects(pRes.data.projects || []);
      } catch (err) {
        setError("Failed to load sprints.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingState message="Loading agile sprint cycles..." />;
  if (error) return <ErrorState message={error} />;

  // Segment tasks into sprints
  const activeSprintTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const completedSprintTasks = tasks.filter((t) => t.status === "COMPLETED");
  const backlogTasks = tasks.filter((t) => t.status === "TODO");

  const sprints = [
    {
      id: "sprint-14",
      title: "Sprint 14 (Active)",
      dates: "Sep 15, 2026 — Sep 29, 2026",
      status: "ACTIVE",
      goal: "Execute core integrations and resolve high-severity blockers across priority projects.",
      tasks: activeSprintTasks,
    },
    {
      id: "sprint-13",
      title: "Sprint 13 (Completed)",
      dates: "Sep 01, 2026 — Sep 15, 2026",
      status: "COMPLETED",
      goal: "Finalize API contracts, establish automated tests, and stand up cloud environments.",
      tasks: completedSprintTasks,
    },
    {
      id: "sprint-15",
      title: "Sprint 15 (Planning)",
      dates: "Sep 30, 2026 — Oct 14, 2026",
      status: "PLANNED",
      goal: "Address telemetry dashboard alerts, mobile offline cache, and UI polish items.",
      tasks: backlogTasks,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Agile Cadence"
        title="Sprints & Iterations"
        description="Two-week sprint delivery intervals, velocity benchmarks, and sprint backlog."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {sprints.map((sprint) => (
          <Card key={sprint.id}>
            <div className="card-header">
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <Badge tone={sprint.status}>{sprint.status}</Badge>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    <Calendar
                      size={13}
                      style={{
                        display: "inline",
                        verticalAlign: "middle",
                        marginRight: 4,
                      }}
                    />
                    {sprint.dates}
                  </span>
                </div>
                <h3 className="card-title" style={{ fontSize: 17 }}>
                  {sprint.title}
                </h3>
                <p className="card-subtitle" style={{ marginTop: 4 }}>
                  {sprint.goal}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}
                >
                  {sprint.tasks.length} tasks assigned
                </span>
              </div>
            </div>

            {sprint.tasks.length === 0 ? (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  padding: "10px 0",
                }}
              >
                No tasks in this sprint.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                {sprint.tasks.slice(0, 4).map((t) => (
                  <div
                    key={t._id}
                    style={{
                      padding: "10px 12px",
                      background: "var(--bg-app)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Badge tone={t.priority}>{t.priority}</Badge>
                      <span
                        style={{ fontSize: 11, color: "var(--text-light)" }}
                      >
                        {t.project?.name || "Project"}
                      </span>
                    </div>
                    <Link
                      to={`/tasks/${t._id}`}
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#0f172a",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {t.title}
                    </Link>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      <Avatar
                        name={t.assignedTo?.name || "User"}
                        avatar={t.assignedTo?.avatar}
                        size="xs"
                      />
                      <span>{t.assignedTo?.name || "Unassigned"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
