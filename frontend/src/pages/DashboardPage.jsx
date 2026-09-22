import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  CheckSquare,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import {
  PageHeader,
  StatCard,
  Card,
  Badge,
  ProgressBar,
  Avatar,
  Button,
  LoadingState,
  ErrorState,
} from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [issues, setIssues] = useState([])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError('')
      try {
        const [projRes, taskRes, issueRes] = await Promise.all([
          api.get('/api/projects'),
          api.get('/api/tasks'),
          api.get('/api/issues'),
        ])
        setProjects(projRes.data.projects || [])
        setTasks(taskRes.data.tasks || [])
        setIssues(issueRes.data.issues || [])
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.message || 'Failed to load workspace metrics.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <LoadingState message="Aggregating workspace analytics..." />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const pendingTasks = tasks.filter((t) => t.status === 'TODO').length

  const openIssues = issues.filter((i) => i.status === 'OPEN').length
  const criticalIssues = issues.filter((i) => i.severity === 'CRITICAL' && i.status !== 'CLOSED').length

  const taskStatusChartData = [
    { name: 'To Do', value: pendingTasks, color: '#94a3b8' },
    { name: 'In Progress', value: inProgressTasks, color: '#f59e0b' },
    { name: 'Completed', value: completedTasks, color: '#10b981' },
  ]

  // Upcoming deadlines (next tasks due)
  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== 'COMPLETED' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)

  const isManager = user?.role === 'PROJECT_MANAGER'

  return (
    <div>
      <PageHeader
        eyebrow="Organisation Overview"
        title={`Welcome back, ${user?.name || 'Collaborator'}`}
        description="Here is the real-time operational health across all your active initiatives."
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            {isManager && (
              <Button icon={Plus} onClick={() => navigate('/projects/new')}>
                New Project
              </Button>
            )}
            <Button variant="secondary" icon={CheckSquare} onClick={() => navigate('/tasks/new')}>
              Add Task
            </Button>
          </div>
        }
      />

      {/* Top Metric Cards */}
      <div className="stat-grid">
        <StatCard
          label="Total Projects"
          value={totalProjects}
          subtext={`${activeProjects} active, ${completedProjects} completed`}
          icon={FolderKanban}
          iconColor="#4f46e5"
          iconBg="#eef2ff"
          trend="up"
        />
        <StatCard
          label="Tasks Completed"
          value={`${completedTasks}/${totalTasks}`}
          subtext={`${totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}% delivery rate`}
          icon={CheckSquare}
          iconColor="#10b981"
          iconBg="#ecfdf5"
          trend="up"
        />
        <StatCard
          label="In-Progress Work"
          value={inProgressTasks}
          subtext={`${pendingTasks} waiting in backlog`}
          icon={Clock}
          iconColor="#f59e0b"
          iconBg="#fffbeb"
        />
        <StatCard
          label="Open Issues"
          value={openIssues}
          subtext={criticalIssues > 0 ? `${criticalIssues} critical blockers` : 'No critical blockers'}
          icon={AlertCircle}
          iconColor="#ef4444"
          iconBg="#fef2f2"
        />
      </div>

      {/* Main Grid: Projects & Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Active Projects Momentum */}
        <Card>
          <div className="card-header">
            <div>
              <h3 className="card-title">Project Progress</h3>
              <p className="card-subtitle">Active delivery streams and target completion</p>
            </div>
            <Link to="/projects" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {projects.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No active projects found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {projects.slice(0, 4).map((p) => {
                const projTasks = tasks.filter((t) => t.project?._id === p._id || t.project === p._id)
                const projCompleted = projTasks.filter((t) => t.status === 'COMPLETED').length
                const pct = projTasks.length ? Math.round((projCompleted / projTasks.length) * 100) : (p.progress || (p.status === 'COMPLETED' ? 100 : 25))

                return (
                  <div key={p._id} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Link to={`/projects/${p._id}`} style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                        {p.name}
                      </Link>
                      <Badge tone={p.status}>{p.status}</Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <ProgressBar value={pct} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Task Status Breakdown Chart */}
        <Card>
          <div className="card-header">
            <div>
              <h3 className="card-title">Task Distribution</h3>
              <p className="card-subtitle">Current workflow volume by execution status</p>
            </div>
            <Link to="/kanban" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Kanban <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskStatusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {taskStatusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Upcoming Deadlines & Recent Issues */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Upcoming Deadlines */}
        <Card>
          <div className="card-header">
            <div>
              <h3 className="card-title">Upcoming Deadlines</h3>
              <p className="card-subtitle">Items requiring prompt attention</p>
            </div>
            <Link to="/calendar" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Calendar <ArrowRight size={14} />
            </Link>
          </div>

          {upcomingTasks.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No immediate deadlines scheduled.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingTasks.map((t) => (
                <div
                  key={t._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                    <Link to={`/tasks/${t._id}`} style={{ fontWeight: 600, fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.title}
                    </Link>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {t.project?.name || 'Project'} • Assigned to {t.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Badge tone={t.priority}>{t.priority}</Badge>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Open Blockers & Issues */}
        <Card>
          <div className="card-header">
            <div>
              <h3 className="card-title">Blockers & Issues</h3>
              <p className="card-subtitle">Tracked anomalies affecting sprints</p>
            </div>
            <Link to="/issues" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {issues.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>All issues resolved! Workspace is clean.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {issues.slice(0, 5).map((iss) => (
                <div
                  key={iss._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                    <Link to={`/issues/${iss._id}`} style={{ fontWeight: 600, fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {iss.title}
                    </Link>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {iss.project?.name || 'Project'} • Reported by {iss.reportedBy?.name || 'Member'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Badge tone={iss.severity}>{iss.severity}</Badge>
                    <Badge tone={iss.status}>{iss.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
