import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'
import {
  PageHeader,
  Card,
  Badge,
  Avatar,
  Button,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'

export function TasksPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [search, setSearch] = useState('')

  async function loadTasks() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/tasks', {
        params: {
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
        },
      })
      setTasks(res.data.tasks || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load task queue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [statusFilter, priorityFilter])

  async function handleStatusChange(taskId, newStatus) {
    try {
      const res = await api.patch(`/api/tasks/${taskId}`, { status: newStatus })
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data.task : t)))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status.')
    }
  }

  async function handleDelete(taskId) {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/api/tasks/${taskId}`)
      setTasks((prev) => prev.filter((t) => t._id !== taskId))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task.')
    }
  }

  const isManager = user?.role === 'PROJECT_MANAGER'

  const filteredTasks = tasks.filter((t) =>
    search ? t.title.toLowerCase().includes(search.toLowerCase()) : true
  )

  return (
    <div>
      <PageHeader
        eyebrow="Execution"
        title="Tasks"
        description="Review, assign, and track engineering tasks across your deliverables."
        actions={
          isManager && (
            <Button icon={Plus} onClick={() => navigate('/tasks/new')}>
              New Task
            </Button>
          )
        }
      />

      {/* Toolbar filters */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '6px 12px', minWidth: 260 }}>
          <Search size={15} color="var(--text-light)" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, width: '100%' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select"
          style={{ width: 160 }}
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="form-select"
          style={{ width: 160 }}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {loading ? (
        <LoadingState message="Fetching workspace task backlog..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadTasks} />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks match the filter"
          description="Adjust your filters or create a new task to organize your work."
          action={
            isManager && (
              <Button icon={Plus} onClick={() => navigate('/tasks/new')}>
                New Task
              </Button>
            )
          }
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                {isManager && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((t) => {
                const isAssignee = t.assignedTo?._id === user?.id
                const canEditStatus = isManager || isAssignee

                return (
                  <tr key={t._id}>
                    <td>
                      <Link
                        to={`/tasks/${t._id}`}
                        style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: '1.5px solid #94a3b8',
                            background: t.status === 'COMPLETED' ? '#10b981' : 'transparent',
                            borderColor: t.status === 'COMPLETED' ? '#10b981' : '#94a3b8',
                            display: 'grid',
                            placeItems: 'center',
                            color: '#fff',
                            fontSize: 10,
                          }}
                        >
                          {t.status === 'COMPLETED' && '✓'}
                        </span>
                        <span>{t.title}</span>
                      </Link>
                    </td>
                    <td>
                      <Link
                        to={`/projects/${t.project?._id}`}
                        style={{ color: 'var(--primary)', fontWeight: 500 }}
                      >
                        {t.project?.name || 'Project'}
                      </Link>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={t.assignedTo?.name || 'User'} avatar={t.assignedTo?.avatar} size="xs" />
                        <span>{t.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td>
                      <Badge tone={t.priority}>{t.priority}</Badge>
                    </td>
                    <td>
                      {canEditStatus ? (
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t._id, e.target.value)}
                          className="form-select"
                          style={{ padding: '4px 8px', fontSize: 12, height: 28, width: 130 }}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      ) : (
                        <Badge tone={t.status}>{t.status}</Badge>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    {isManager && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <Link to={`/tasks/${t._id}/edit`} style={{ color: 'var(--text-light)', padding: 4 }} title="Edit task">
                            <Edit size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(t._id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                            title="Delete task"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function TaskFormPage({ edit = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [projectsList, setProjectsList] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function init() {
      try {
        const pRes = await api.get('/api/projects')
        const projs = pRes.data.projects || []
        setProjectsList(projs)

        if (edit) {
          const tRes = await api.get(`/api/tasks/${id}`)
          const t = tRes.data.task
          setForm({
            title: t.title || '',
            description: t.description || '',
            project: t.project?._id || '',
            assignedTo: t.assignedTo?._id || '',
            status: t.status || 'TODO',
            priority: t.priority || 'MEDIUM',
            dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
          })
        } else if (projs.length > 0) {
          // prefill first project
          setForm((prev) => ({ ...prev, project: projs[0]._id }))
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize task form.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [edit, id])

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Selected project members
  const selectedProject = projectsList.find((p) => p._id === form.project)
  const assignableMembers = selectedProject?.members || []

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.project || !form.assignedTo) {
      setError('Please select both a project and an assigned member from the project.')
      return
    }

    setSubmitting(true)
    try {
      if (edit) {
        await api.put(`/api/tasks/${id}`, form)
        navigate(`/tasks/${id}`)
      } else {
        const res = await api.post('/api/tasks', form)
        navigate(`/tasks/${res.data.task._id}`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState message="Loading task specifications..." />

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--text-muted)',
          fontSize: 13,
          cursor: 'pointer',
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <PageHeader
        eyebrow="Task Specification"
        title={edit ? 'Edit Task' : 'Create New Task'}
        description="Define task requirements, assignment, priority, and timeline."
      />

      <Card>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              name="title"
              type="text"
              className="form-input"
              placeholder="e.g. Implement OAuth callback flow"
              value={form.title}
              onChange={update}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Acceptance Criteria</label>
            <textarea
              name="description"
              rows={4}
              className="form-textarea"
              placeholder="Context, requirements, and links to tickets..."
              value={form.description}
              onChange={update}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select
                name="project"
                className="form-select"
                value={form.project}
                onChange={(e) => {
                  setForm({ ...form, project: e.target.value, assignedTo: '' })
                }}
                required
              >
                <option value="">Select project...</option>
                {projectsList.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assignee (Project Member) *</label>
              <select
                name="assignedTo"
                className="form-select"
                value={form.assignedTo}
                onChange={update}
                required
              >
                <option value="">Select assignee...</option>
                {assignableMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select name="priority" className="form-select" value={form.priority} onChange={update}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={form.status} onChange={update}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                name="dueDate"
                type="date"
                className="form-input"
                value={form.dueDate}
                onChange={update}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : edit ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export function TaskDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTask() {
      setLoading(true)
      try {
        const res = await api.get(`/api/tasks/${id}`)
        setTask(res.data.task)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load task details.')
      } finally {
        setLoading(false)
      }
    }
    loadTask()
  }, [id])

  async function updateStatus(newStatus) {
    try {
      const res = await api.patch(`/api/tasks/${id}`, { status: newStatus })
      setTask(res.data.task)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change task status.')
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/api/tasks/${id}`)
      navigate('/tasks')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task.')
    }
  }

  if (loading) return <LoadingState message="Loading task details..." />
  if (error || !task) return <ErrorState message={error || 'Task not found.'} onRetry={() => navigate('/tasks')} />

  const isManager = user?.role === 'PROJECT_MANAGER'
  const isAssignee = task.assignedTo?._id === user?.id

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/tasks')}
        style={{
          background: 'none',
          border: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--text-muted)',
          fontSize: 13,
          cursor: 'pointer',
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={16} /> Back to Tasks
      </button>

      <PageHeader
        eyebrow={`Task / ${task.project?.name || 'Project'}`}
        title={task.title}
        description={`Created by ${task.createdBy?.name || 'Manager'} on ${new Date(task.createdAt).toLocaleDateString()}`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {isManager && (
              <>
                <Link to={`/tasks/${id}/edit`}>
                  <Button variant="secondary" size="sm" icon={Edit}>
                    Edit
                  </Button>
                </Link>
                <Button variant="danger" size="sm" icon={Trash2} onClick={handleDelete}>
                  Delete
                </Button>
              </>
            )}
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <Card style={{ padding: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</span>
          <div style={{ marginTop: 8 }}>
            {isManager || isAssignee ? (
              <select
                value={task.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="form-select"
                style={{ fontSize: 13, height: 32 }}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            ) : (
              <Badge tone={task.status}>{task.status}</Badge>
            )}
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Priority</span>
          <div style={{ marginTop: 8 }}>
            <Badge tone={task.priority}>{task.priority}</Badge>
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Assignee</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <Avatar name={task.assignedTo?.name || 'User'} avatar={task.assignedTo?.avatar} size="xs" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{task.assignedTo?.name || 'Unassigned'}</span>
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due Date</span>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 8 }}>
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="card-title" style={{ marginBottom: 12 }}>
          Task Description
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
          {task.description || 'No detailed specifications or acceptance criteria were written for this task.'}
        </p>
      </Card>
    </div>
  )
}
