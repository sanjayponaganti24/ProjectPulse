import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowLeft,
  Shield,
  Layers,
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

export function IssuesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [search, setSearch] = useState('')

  async function loadIssues() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/issues', {
        params: {
          status: statusFilter || undefined,
          severity: severityFilter || undefined,
        },
      })
      setIssues(res.data.issues || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load issues.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIssues()
  }, [statusFilter, severityFilter])

  async function handleDelete(issueId) {
    if (!window.confirm('Delete this issue report?')) return
    try {
      await api.delete(`/api/issues/${issueId}`)
      setIssues((prev) => prev.filter((i) => i._id !== issueId))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete issue.')
    }
  }

  const isManager = user?.role === 'PROJECT_MANAGER'

  const filteredIssues = issues.filter((i) =>
    search ? i.title.toLowerCase().includes(search.toLowerCase()) : true
  )

  return (
    <div>
      <PageHeader
        eyebrow="Triage & Stability"
        title="Issues & Bug Tracker"
        description="Capture software anomalies, triage severity, and coordinate resolutions."
        actions={
          <Button variant="danger" icon={Plus} onClick={() => navigate('/issues/new')}>
            Report Issue
          </Button>
        }
      />

      {/* Filters Toolbar */}
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
            placeholder="Search issues..."
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
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="form-select"
          style={{ width: 160 }}
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {loading ? (
        <LoadingState message="Fetching issue registry..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadIssues} />
      ) : filteredIssues.length === 0 ? (
        <EmptyState
          title="No issues found"
          description="Your sprint is clean! Report an issue if a bug or blocker arises."
          action={
            <Button variant="danger" icon={Plus} onClick={() => navigate('/issues/new')}>
              Report Issue
            </Button>
          }
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Issue Summary</th>
                <th>Project</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Reported By</th>
                <th>Assigned To</th>
                {isManager && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((iss) => (
                <tr key={iss._id}>
                  <td>
                    <Link
                      to={`/issues/${iss._id}`}
                      style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <AlertCircle size={15} color={iss.severity === 'CRITICAL' || iss.severity === 'HIGH' ? '#ef4444' : '#f59e0b'} />
                      <span>{iss.title}</span>
                    </Link>
                  </td>
                  <td>
                    <Link to={`/projects/${iss.project?._id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
                      {iss.project?.name || 'Project'}
                    </Link>
                  </td>
                  <td>
                    <Badge tone={iss.severity}>{iss.severity}</Badge>
                  </td>
                  <td>
                    <Badge tone={iss.status}>{iss.status}</Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar name={iss.reportedBy?.name || 'User'} avatar={iss.reportedBy?.avatar} size="xs" />
                      <span>{iss.reportedBy?.name || 'Reporter'}</span>
                    </div>
                  </td>
                  <td>
                    {iss.assignedTo ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar name={iss.assignedTo.name} avatar={iss.assignedTo.avatar} size="xs" />
                        <span>{iss.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: 12 }}>Unassigned</span>
                    )}
                  </td>
                  {isManager && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <Link to={`/issues/${iss._id}/edit`} style={{ color: 'var(--text-light)', padding: 4 }} title="Edit issue">
                          <Edit size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(iss._id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                          title="Delete issue"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function IssueFormPage({ edit = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [projectsList, setProjectsList] = useState([])
  const [tasksList, setTasksList] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    project: '',
    task: '',
    assignedTo: '',
    severity: 'MEDIUM',
    status: 'OPEN',
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function init() {
      try {
        const [pRes, tRes] = await Promise.all([
          api.get('/api/projects'),
          api.get('/api/tasks'),
        ])
        const projs = pRes.data.projects || []
        setProjectsList(projs)
        setTasksList(tRes.data.tasks || [])

        if (edit) {
          const iRes = await api.get(`/api/issues/${id}`)
          const iss = iRes.data.issue
          setForm({
            title: iss.title || '',
            description: iss.description || '',
            project: iss.project?._id || '',
            task: iss.task?._id || '',
            assignedTo: iss.assignedTo?._id || '',
            severity: iss.severity || 'MEDIUM',
            status: iss.status || 'OPEN',
          })
        } else if (projs.length > 0) {
          setForm((prev) => ({ ...prev, project: projs[0]._id }))
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize issue form.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [edit, id])

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const selectedProject = projectsList.find((p) => p._id === form.project)
  const assignableMembers = selectedProject ? [selectedProject.manager, ...(selectedProject.members || [])].filter(Boolean) : []
  const projectTasks = tasksList.filter((t) => t.project?._id === form.project || t.project === form.project)

  const isManager = user?.role === 'PROJECT_MANAGER'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.project) {
      setError('Please select a project.')
      return
    }

    setSubmitting(true)
    const payload = {
      ...form,
      task: form.task || undefined,
      assignedTo: form.assignedTo || undefined,
    }

    try {
      if (edit) {
        await api.put(`/api/issues/${id}`, payload)
        navigate(`/issues/${id}`)
      } else {
        const res = await api.post('/api/issues', payload)
        navigate(`/issues/${res.data.issue._id}`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save issue report.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState message="Loading issue editor..." />

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
        eyebrow="Triage Entry"
        title={edit ? 'Edit Issue Report' : 'Report New Issue'}
        description="Detail unexpected behavior, affected subsystems, and priority."
      />

      <Card>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Issue Title *</label>
            <input
              name="title"
              type="text"
              className="form-input"
              placeholder="e.g. Memory leak during session refresh"
              value={form.title}
              onChange={update}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Issue Description & Reproduction Steps</label>
            <textarea
              name="description"
              rows={4}
              className="form-textarea"
              placeholder="Steps to reproduce, expected vs actual behavior, stack traces..."
              value={form.description}
              onChange={update}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Affected Project *</label>
              <select
                name="project"
                className="form-select"
                value={form.project}
                onChange={(e) => {
                  setForm({ ...form, project: e.target.value, task: '', assignedTo: '' })
                }}
                disabled={edit}
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
              <label className="form-label">Related Task (Optional)</label>
              <select name="task" className="form-select" value={form.task} onChange={update}>
                <option value="">No linked task</option>
                {projectTasks.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Severity</label>
              <select name="severity" className="form-select" value={form.severity} onChange={update}>
                <option value="LOW">Low (Cosmetic)</option>
                <option value="MEDIUM">Medium (Minor bug)</option>
                <option value="HIGH">High (Major defect)</option>
                <option value="CRITICAL">Critical (System down)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={form.status} onChange={update}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {isManager && (
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select name="assignedTo" className="form-select" value={form.assignedTo} onChange={update}>
                  <option value="">Unassigned</option>
                  {assignableMembers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={submitting}>
              {submitting ? 'Saving...' : edit ? 'Update Issue' : 'File Issue'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export function IssueDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadIssue() {
      setLoading(true)
      try {
        const res = await api.get(`/api/issues/${id}`)
        setIssue(res.data.issue)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load issue details.')
      } finally {
        setLoading(false)
      }
    }
    loadIssue()
  }, [id])

  async function handleDelete() {
    if (!window.confirm('Delete this issue?')) return
    try {
      await api.delete(`/api/issues/${id}`)
      navigate('/issues')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete issue.')
    }
  }

  if (loading) return <LoadingState message="Loading issue details..." />
  if (error || !issue) return <ErrorState message={error || 'Issue not found.'} onRetry={() => navigate('/issues')} />

  const isManager = user?.role === 'PROJECT_MANAGER'

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/issues')}
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
        <ArrowLeft size={16} /> Back to Issues
      </button>

      <PageHeader
        eyebrow={`Issue / ${issue.project?.name || 'Project'}`}
        title={issue.title}
        description={`Reported by ${issue.reportedBy?.name || 'Member'} on ${new Date(issue.createdAt).toLocaleDateString()}`}
        actions={
          isManager && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to={`/issues/${id}/edit`}>
                <Button variant="secondary" size="sm" icon={Edit}>
                  Edit
                </Button>
              </Link>
              <Button variant="danger" size="sm" icon={Trash2} onClick={handleDelete}>
                Delete
              </Button>
            </div>
          )
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <Card style={{ padding: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</span>
          <div style={{ marginTop: 8 }}>
            <Badge tone={issue.status}>{issue.status}</Badge>
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Severity</span>
          <div style={{ marginTop: 8 }}>
            <Badge tone={issue.severity}>{issue.severity}</Badge>
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Assigned To</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            {issue.assignedTo ? (
              <>
                <Avatar name={issue.assignedTo.name} avatar={issue.assignedTo.avatar} size="xs" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{issue.assignedTo.name}</span>
              </>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--text-light)' }}>Unassigned</span>
            )}
          </div>
        </Card>

        {issue.task && (
          <Card style={{ padding: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Linked Task</span>
            <div style={{ marginTop: 8 }}>
              <Link to={`/tasks/${issue.task._id}`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
                {issue.task.title}
              </Link>
            </div>
          </Card>
        )}
      </div>

      <Card>
        <h3 className="card-title" style={{ marginBottom: 12 }}>
          Issue Details & Reproduction
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
          {issue.description || 'No additional notes or reproduction steps provided.'}
        </p>
      </Card>
    </div>
  )
}
