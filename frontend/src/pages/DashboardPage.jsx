import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Check,
  CircleAlert,
  ClipboardList,
  FolderKanban,
  Plus,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  ProgressBar,
} from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'

function greetingForHour(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function projectProgressPercent(project, tasks) {
  const projectTasks = tasks.filter(
    (t) => t.project?._id === project._id || t.project === project._id,
  )
  if (projectTasks.length) {
    const done = projectTasks.filter((t) => t.status === 'COMPLETED').length
    return Math.round((done / projectTasks.length) * 100)
  }
  if (project.status === 'COMPLETED') return 100
  if (project.status === 'ACTIVE') return 50
  return 0
}

function taskSummaryForProject(project, tasks) {
  const projectTasks = tasks.filter(
    (t) => t.project?._id === project._id || t.project === project._id,
  )
  const open = projectTasks.filter((t) => t.status !== 'COMPLETED').length
  const done = projectTasks.filter((t) => t.status === 'COMPLETED').length
  if (!projectTasks.length) return 'No tasks linked'
  return `${open} open · ${done} completed`
}

function formatDueLabel(dueDate) {
  const due = startOfDay(dueDate)
  const today = startOfDay(new Date())
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  return due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function buildRecentActivity(tasks, issues, projects) {
  const events = []

  tasks.forEach((task) => {
    const time = task.updatedAt || task.createdAt
    if (!time) return
    events.push({
      id: `task-${task._id}`,
      time: new Date(time),
      label: task.status === 'COMPLETED' ? 'Task completed' : 'Task updated',
      title: task.title,
      meta: task.project?.name || 'Project',
      link: `/tasks/${task._id}`,
      tone: 'task',
    })
  })

  issues.forEach((issue) => {
    const time = issue.updatedAt || issue.createdAt
    if (!time) return
    events.push({
      id: `issue-${issue._id}`,
      time: new Date(time),
      label: 'Issue updated',
      title: issue.title,
      meta: issue.project?.name || 'Project',
      link: `/issues/${issue._id}`,
      tone: 'issue',
    })
  })

  projects.forEach((project) => {
    const time = project.updatedAt || project.createdAt
    if (!time) return
    events.push({
      id: `project-${project._id}`,
      time: new Date(time),
      label: 'Project updated',
      title: project.name,
      meta: project.status?.replace('_', ' ') || 'Project',
      link: `/projects/${project._id}`,
      tone: 'project',
    })
  })

  return events.sort((a, b) => b.time - a.time).slice(0, 8)
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [projectsResponse, tasksResponse, issuesResponse] = await Promise.all([
        api.get('/api/projects'),
        api.get('/api/tasks'),
        api.get('/api/issues'),
      ])
      setProjects(projectsResponse.data.projects || [])
      setTasks(tasksResponse.data.tasks || [])
      setIssues(issuesResponse.data.issues || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const metrics = useMemo(() => {
    const today = startOfDay(new Date())
    const activeProjectList = projects.filter((p) => p.status === 'ACTIVE')
    const openTasks = tasks.filter((t) => t.status !== 'COMPLETED')
    const overdueTasks = tasks.filter((t) => {
      if (t.status === 'COMPLETED' || !t.dueDate) return false
      return startOfDay(t.dueDate) < today
    })
    const openIssues = issues.filter((i) => !['RESOLVED', 'CLOSED'].includes(i.status))
    const todoTasks = tasks.filter((t) => t.status === 'TODO').length
    const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length

    return {
      activeProjectList,
      openTasks,
      overdueTasks,
      openIssues,
      todoTasks,
      inProgressTasks,
      completedTasks,
    }
  }, [projects, tasks, issues])

  const upcomingDeadlines = useMemo(() => {
    const today = startOfDay(new Date())
    return tasks
      .filter((t) => t.status !== 'COMPLETED' && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 6)
      .map((t) => ({
        ...t,
        isOverdue: startOfDay(t.dueDate) < today,
      }))
  }, [tasks])

  const recentTasks = useMemo(
    () =>
      [...tasks]
        .filter((t) => t.dueDate || t.status !== 'COMPLETED')
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
        .slice(0, 5),
    [tasks],
  )

  const recentActivity = useMemo(
    () => buildRecentActivity(tasks, issues, projects),
    [tasks, issues, projects],
  )

  const chartData = useMemo(
    () => [
      { name: 'To do', value: metrics.todoTasks, fill: '#94a3b8' },
      { name: 'In progress', value: metrics.inProgressTasks, fill: '#f59e0b' },
      { name: 'Completed', value: metrics.completedTasks, fill: '#4658d6' },
    ],
    [metrics],
  )

  const isOrgAdmin = user?.role === 'ORGANISATION_ADMIN'
  const isPM = user?.role === 'PROJECT_MANAGER'
  const isTeamLead = user?.role === 'TEAM_LEAD'
  const isMember = user?.role === 'MEMBER'
  const isStakeholder = user?.role === 'STAKEHOLDER'
  const canManage = isOrgAdmin || isPM

  const greeting = greetingForHour(new Date().getHours())
  const firstName = user?.name?.split(' ')[0] || 'there'

  const workspaceSummary = `${projects.length} project${projects.length === 1 ? '' : 's'} · ${metrics.openTasks.length} open task${metrics.openTasks.length === 1 ? '' : 's'} · ${metrics.openIssues.length} open issue${metrics.openIssues.length === 1 ? '' : 's'}`

  if (loading) {
    return <LoadingState message="Loading dashboard..." />
  }

  if (error && !projects.length && !tasks.length && !issues.length) {
    return <ErrorState message={error} onRetry={loadDashboard} />
  }

  const displayProjects =
    metrics.activeProjectList.length > 0
      ? metrics.activeProjectList.slice(0, 5)
      : projects.slice(0, 5)

  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow="Workspace overview"
        title={`${greeting}, ${firstName}`}
        description={workspaceSummary}
        actions={
          <div className="dashboard-header-actions">
            {canManage && (
              <Button icon={Plus} onClick={() => navigate('/projects/new')}>
                Create project
              </Button>
            )}
            {isTeamLead && (
              <Button icon={Plus} onClick={() => navigate('/tasks/new')}>
                Create task
              </Button>
            )}
            {isMember && (
              <Button icon={CircleAlert} variant="secondary" onClick={() => navigate('/issues/new')}>
                Report issue
              </Button>
            )}
            {isStakeholder && (
              <Button icon={Activity} variant="secondary" onClick={() => navigate('/reports')}>
                View reports
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <div className="form-error dashboard-banner-error">
          <CircleAlert size={16} />
          {error}
        </div>
      )}

      <div className="dashboard-quick-actions">
        {canManage && (
          <Button icon={FolderKanban} variant="secondary" onClick={() => navigate('/projects/new')}>
            Create project
          </Button>
        )}
        {(canManage || isTeamLead) && (
          <Button icon={ClipboardList} variant="secondary" onClick={() => navigate('/tasks/new')}>
            Create task
          </Button>
        )}
        {!isStakeholder && (
          <Button icon={CircleAlert} variant="secondary" onClick={() => navigate('/issues/new')}>
            Report issue
          </Button>
        )}
        {isOrgAdmin && (
          <Button icon={FolderKanban} variant="secondary" onClick={() => navigate('/team')}>
            Manage team & roles
          </Button>
        )}
        {(isOrgAdmin || isPM || isStakeholder) && (
          <Button icon={Activity} variant="secondary" onClick={() => navigate('/reports')}>
            View reports
          </Button>
        )}
        {isStakeholder && (
          <Button icon={CalendarDays} variant="secondary" onClick={() => navigate('/milestones')}>
            Milestones
          </Button>
        )}
      </div>

      <div className="stat-grid dashboard-stat-grid">
        <Card className="stat-card">
          <div className="stat-icon stat-0">
            <FolderKanban size={18} />
          </div>
          <span>Total projects</span>
          <strong>{projects.length}</strong>
          <small>{metrics.activeProjectList.length} active now</small>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon stat-1">
            <Activity size={18} />
          </div>
          <span>Active projects</span>
          <strong>{metrics.activeProjectList.length}</strong>
          <small>{projects.filter((p) => p.status === 'PLANNED').length} planned</small>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">
            <ClipboardList size={18} />
          </div>
          <span>Tasks</span>
          <strong>{tasks.length}</strong>
          <small>
            {metrics.openTasks.length} open · {metrics.completedTasks} done
          </small>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon stat-3">
            <CalendarDays size={18} />
          </div>
          <span>Overdue tasks</span>
          <strong>{metrics.overdueTasks.length}</strong>
          <small>{metrics.overdueTasks.length ? 'Needs attention' : 'All on schedule'}</small>
        </Card>
      </div>

      <div className="dashboard-layout">
        <div className="dashboard-column dashboard-column-main">
          <Card className="dashboard-section-card">
            <div className="section-heading">
              <div>
                <h2>Active projects</h2>
                <p>Status, progress, and deadlines from your workspace.</p>
              </div>
              <Link to="/projects">
                View all <ArrowRight size={15} />
              </Link>
            </div>
            {displayProjects.length === 0 ? (
              <EmptyState
                title="No projects yet"
                description="Create a project to start tracking delivery."
                action={
                  canManage && (
                    <Button icon={Plus} onClick={() => navigate('/projects/new')}>
                      Create project
                    </Button>
                  )
                }
              />
            ) : (
              <div className="dashboard-project-list">
                {displayProjects.map((project) => {
                  const progress = projectProgressPercent(project, tasks)
                  return (
                    <Link to={`/projects/${project._id}`} className="dashboard-project-row" key={project._id}>
                      <div className="project-avatar">{project.name?.[0] || 'P'}</div>
                      <div className="dashboard-project-body">
                        <div className="dashboard-project-top">
                          <strong>{project.name}</strong>
                          <Badge tone={project.status}>{project.status}</Badge>
                        </div>
                        <ProgressBar value={progress} />
                        <div className="dashboard-project-meta">
                          <span>{progress}% complete</span>
                          <span>{taskSummaryForProject(project, tasks)}</span>
                          <span>
                            <CalendarDays size={13} />
                            {project.deadline
                              ? new Date(project.deadline).toLocaleDateString()
                              : 'No deadline'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>

          <Card className="dashboard-section-card">
            <div className="section-heading">
              <div>
                <h2>Task workload</h2>
                <p>Distribution by status across all projects.</p>
              </div>
              <Link to="/tasks">
                View tasks <ArrowRight size={15} />
              </Link>
            </div>
            {tasks.length === 0 ? (
              <EmptyState
                title="No tasks yet"
                description="Create tasks to see workload distribution."
                action={
                  canManage && (
                    <Button icon={Plus} onClick={() => navigate('/tasks/new')}>
                      Create task
                    </Button>
                  )
                }
              />
            ) : (
              <div className="chart-wrap dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8ebf0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#f6f8fb' }} />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        <div className="dashboard-column dashboard-column-side">
          <Card className="dashboard-section-card">
            <div className="section-heading">
              <div>
                <h2>Upcoming deadlines</h2>
                <p>Due dates sorted nearest first.</p>
              </div>
              <Link to="/tasks">
                Tasks <ArrowRight size={15} />
              </Link>
            </div>
            {upcomingDeadlines.length === 0 ? (
              <EmptyState title="No upcoming deadlines" description="Tasks with due dates will appear here." />
            ) : (
              <ul className="deadline-list">
                {upcomingDeadlines.map((task) => (
                  <li key={task._id} className={task.isOverdue ? 'deadline-item overdue' : 'deadline-item'}>
                    <div className="deadline-date">
                      <strong>{formatDueLabel(task.dueDate)}</strong>
                      <small>{new Date(task.dueDate).toLocaleDateString()}</small>
                    </div>
                    <div className="deadline-detail">
                      <Link to={`/tasks/${task._id}`}>{task.title}</Link>
                      <small>{task.project?.name || 'Project'}</small>
                    </div>
                    <Badge tone={task.isOverdue ? 'high' : task.priority}>{task.isOverdue ? 'Overdue' : task.priority}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="dashboard-section-card">
            <div className="section-heading">
              <div>
                <h2>Recent & upcoming tasks</h2>
                <p>Status, priority, assignee, and due date.</p>
              </div>
            </div>
            {recentTasks.length === 0 ? (
              <EmptyState title="No tasks to show" description="Tasks will appear here once created." />
            ) : (
              <div className="dashboard-task-list">
                {recentTasks.map((task) => (
                  <div className="dashboard-task-row" key={task._id}>
                    <span className={`task-check ${task.status === 'COMPLETED' ? 'done' : ''}`}>
                      {task.status === 'COMPLETED' && <Check size={12} />}
                    </span>
                    <div className="dashboard-task-main">
                      <Link to={`/tasks/${task._id}`}>
                        <strong>{task.title}</strong>
                      </Link>
                      <small>
                        {task.project?.name || 'Project'}
                        {task.dueDate ? ` · Due ${new Date(task.dueDate).toLocaleDateString()}` : ''}
                      </small>
                    </div>
                    <div className="dashboard-task-badges">
                      <Badge tone={task.status}>{task.status.replace('_', ' ')}</Badge>
                      <Badge tone={task.priority}>{task.priority}</Badge>
                    </div>
                    <span className="assignee dashboard-task-assignee">
                      <Avatar name={task.assignedTo?.name || 'Unassigned'} size="sm" />
                      <span>{task.assignedTo?.name || 'Unassigned'}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="dashboard-grid dashboard-bottom-grid">
        <Card className="dashboard-section-card">
          <div className="section-heading">
            <div>
              <h2>Issues needing attention</h2>
              <p>Open blockers with severity and project context.</p>
            </div>
            <Link to="/issues">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          {metrics.openIssues.length === 0 ? (
            <EmptyState
              title="No open issues"
              description="Reported issues that need resolution will appear here."
              action={
                <Button variant="danger" icon={Plus} onClick={() => navigate('/issues/new')}>
                  Report issue
                </Button>
              }
            />
          ) : (
            <div className="activity-list">
              {metrics.openIssues.slice(0, 5).map((issue) => (
                <Link to={`/issues/${issue._id}`} className="activity-row dashboard-issue-row" key={issue._id}>
                  <span className="issue-marker">
                    <CircleAlert size={15} />
                  </span>
                  <div>
                    <strong>{issue.title}</strong>
                    <small>
                      {issue.project?.name || 'Project'}
                      {issue.task?.title ? ` · ${issue.task.title}` : ''}
                      {' · '}
                      {issue.status.replace('_', ' ')}
                    </small>
                  </div>
                  <div className="dashboard-issue-badges">
                    <Badge tone={issue.severity}>{issue.severity}</Badge>
                    <Badge tone={issue.status}>{issue.status.replace('_', ' ')}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="dashboard-section-card">
          <div className="section-heading">
            <div>
              <h2>Recent activity</h2>
              <p>Latest updates from projects, tasks, and issues.</p>
            </div>
          </div>
          {recentActivity.length === 0 ? (
            <EmptyState
              title="No recent activity"
              description="Updates will appear here when projects, tasks, or issues change."
            />
          ) : (
            <ul className="activity-feed">
              {recentActivity.map((event) => (
                <li key={event.id} className={`activity-feed-item activity-${event.tone}`}>
                  <div className="activity-feed-dot" aria-hidden />
                  <div className="activity-feed-body">
                    <span className="activity-feed-label">{event.label}</span>
                    <Link to={event.link}>{event.title}</Link>
                    <small>
                      {event.meta} · {event.time.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
