import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, FileText, Bell, Check } from "lucide-react";
import {
  PageHeader,
  Card,
  Badge,
  Avatar,
  Button,
  LoadingState,
  EmptyState,
} from "../components/UI.jsx";
import api from "../services/api.js";

export function ActivityPage() {
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      try {
        const [tRes, iRes, pRes] = await Promise.all([
          api.get("/tasks"),
          api.get("/issues"),
          api.get("/projects"),
        ]);
        setTasks(tRes.data.tasks || []);
        setIssues(iRes.data.issues || []);
        setProjects(pRes.data.projects || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, []);

  if (loading) return <LoadingState message="Aggregating activity stream..." />;

  // Generate realistic activity events derived from real DB data
  const events = [
    ...tasks.map((t) => ({
      id: `task-${t._id}`,
      user: t.assignedTo || t.createdBy,
      action: t.status === "COMPLETED" ? "completed task" : "updated task",
      target: t.title,
      link: `/tasks/${t._id}`,
      project: t.project?.name,
      time: new Date(t.updatedAt || t.createdAt),
      type: "task",
    })),
    ...issues.map((i) => ({
      id: `issue-${i._id}`,
      user: i.reportedBy,
      action: "reported issue",
      target: i.title,
      link: `/issues/${i._id}`,
      project: i.project?.name,
      time: new Date(i.createdAt),
      type: "issue",
    })),
    ...projects.map((p) => ({
      id: `project-${p._id}`,
      user: p.manager,
      action: "initialized initiative",
      target: p.name,
      link: `/projects/${p._id}`,
      project: p.name,
      time: new Date(p.createdAt),
      type: "project",
    })),
  ].sort((a, b) => b.time - a.time);

  return (
    <div>
      <PageHeader
        eyebrow="Chronicle"
        title="Comments & Activity"
        description="Unified audit feed of updates, status transitions, and contributor collaboration."
      />

      <Card style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {events.map((evt) => (
            <div
              key={evt.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 8,
                background: "var(--bg-app)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Avatar
                name={evt.user?.name || "User"}
                avatar={evt.user?.avatar}
                size="sm"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "var(--text-main)" }}>
                  <strong>{evt.user?.name || "Contributor"}</strong>{" "}
                  <span style={{ color: "var(--text-muted)" }}>
                    {evt.action}
                  </span>{" "}
                  <Link
                    to={evt.link}
                    style={{ fontWeight: 600, color: "var(--primary)" }}
                  >
                    "{evt.target}"
                  </Link>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-light)",
                    marginTop: 4,
                    display: "flex",
                    gap: 10,
                  }}
                >
                  {evt.project && (
                    <span>
                      in <strong>{evt.project}</strong>
                    </span>
                  )}
                  <span>•</span>
                  <span>
                    {evt.time.toLocaleDateString()} at{" "}
                    {evt.time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <Badge
                tone={
                  evt.type === "issue"
                    ? "critical"
                    : evt.type === "task"
                      ? "active"
                      : "low"
                }
              >
                {evt.type}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function FilesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Storage & Documents"
        title="Files & Deliverables"
        description="Specifications, architectural diagrams, compliance matrices, and assets."
      />

      <Card>
        <EmptyState
          icon={FileText}
          title="File storage is not configured"
          description="Uploaded project files will appear here after file storage is implemented."
        />
      </Card>
    </div>
  );
}

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [notifications, setNotifications] = useState([]);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function toggleRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  }

  const filtered = notifications.filter((n) =>
    activeTab === "ALL" ? true : n.category === activeTab,
  );

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Alerts, task assignments, blocker notifications, and mentions."
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={Check}
            onClick={markAllRead}
          >
            Mark all read
          </Button>
        }
      />

      {/* Tabs */}
      <div className="tabs-nav">
        {["ALL", "TASKS", "ISSUES", "MENTIONS", "SYSTEM"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Card style={{ padding: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                padding: 24,
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              No notifications in this filter category.
            </p>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: n.read ? "#ffffff" : "var(--primary-subtle)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                }}
                onClick={() => toggleRead(n.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: n.read ? "transparent" : "var(--primary)",
                    }}
                  />
                  <div>
                    <strong
                      style={{
                        fontSize: 13,
                        color: "#0f172a",
                        display: "block",
                      }}
                    >
                      {n.title}
                    </strong>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        margin: "2px 0 0",
                      }}
                    >
                      {n.desc}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 11, color: "var(--text-light)" }}>
                    {n.time}
                  </span>
                  <Badge tone="low">{n.category}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
