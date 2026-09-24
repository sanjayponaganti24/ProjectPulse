import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Plus, Calendar, CheckSquare, Clock, CheckCircle2 } from "lucide-react";
import {
  PageHeader,
  Badge,
  Avatar,
  Button,
  LoadingState,
  ErrorState,
} from "../components/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const COLUMNS = [
  { id: "TODO", label: "To Do", icon: Clock, color: "#94a3b8" },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    icon: CheckSquare,
    color: "#f59e0b",
  },
  { id: "COMPLETED", label: "Completed", icon: CheckCircle2, color: "#10b981" },
];

function KanbanCardItem({ task, isOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task._id,
    });

  const style =
    transform && !isOverlay
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${isDragging ? "dragging" : ""} ${isOverlay ? "overlay" : ""}`}
      {...listeners}
      {...attributes}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Badge tone={task.priority}>{task.priority}</Badge>
        <span style={{ fontSize: 11, color: "var(--text-light)" }}>
          {task.project?.name || "Project"}
        </span>
      </div>

      <Link
        to={`/tasks/${task._id}`}
        onClick={(e) => isDragging && e.preventDefault()}
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#0f172a",
          lineHeight: 1.4,
          display: "block",
        }}
      >
        {task.title}
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 6,
          paddingTop: 8,
          borderTop: "1px solid var(--border-subtle)",
          fontSize: 11,
          color: "var(--text-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Avatar
            name={task.assignedTo?.name || "User"}
            avatar={task.assignedTo?.avatar}
            size="xs"
          />
          <span
            style={{
              maxWidth: 85,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.assignedTo?.name || "Unassigned"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Calendar size={12} />
          <span>
            {new Date(task.dueDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

function KanbanColumnDroppable({ column, tasks }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const Icon = column.icon;

  return (
    <div ref={setNodeRef} className={`kanban-col ${isOver ? "over" : ""}`}>
      <div className="kanban-header">
        <div className="kanban-title">
          <Icon size={16} color={column.color} />
          <span>{column.label}</span>
        </div>
        <span className="kanban-count">{tasks.length}</span>
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}
      >
        {tasks.map((task) => (
          <KanbanCardItem key={task._id} task={task} />
        ))}

        {tasks.length === 0 && (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              border: "1.5px dashed var(--border-hover)",
              borderRadius: 8,
              color: "var(--text-light)",
              fontSize: 12,
              margin: "auto 0",
            }}
          >
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  async function loadTasks() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load board tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function handleDragStart(event) {
    const task = tasks.find((t) => t._id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)),
    );

    try {
      const res = await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data.task : t)),
      );
    } catch (err) {
      // Rollback on failure
      setTasks(previousTasks);
      alert(
        err.response?.data?.message ||
          "Failed to update task status. Rolled back.",
      );
    }
  }

  const isManager = user?.role === "PROJECT_MANAGER";

  if (loading) return <LoadingState message="Loading interactive board..." />;
  if (error) return <ErrorState message={error} onRetry={loadTasks} />;

  return (
    <div>
      <PageHeader
        eyebrow="Workflow Board"
        title="Kanban Board"
        description="Drag cards across execution stages to update status in real time."
        actions={
          isManager && (
            <Button icon={Plus} onClick={() => navigate("/tasks/new")}>
              Add Task
            </Button>
          )
        }
      />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-grid">
          {COLUMNS.map((col) => (
            <KanbanColumnDroppable
              key={col.id}
              column={col}
              tasks={tasks.filter((t) => t.status === col.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <KanbanCardItem task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
