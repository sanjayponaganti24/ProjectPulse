import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  FolderKanban,
  MoreHorizontal,
  Plus,
  Search,
  Target,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
} from './components/UI.jsx'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { useAuth } from './context/AuthContext.jsx'
import api from './services/api.js'

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  )
}

function LandingPage() {
  return <div className="landing"><header className="landing-nav"><Link to="/" className="brand"><span className="brand-mark">P</span><span>Project<span className="brand-accent">Pulse</span></span></Link><nav><Link to="/login">Sign in</Link><Link to="/register" className="button button-primary">Get started <ArrowRight size={15} /></Link></nav></header><main className="landing-hero"><div className="eyebrow">Plan. Assign. Track. Complete.</div><h1>Make progress <span>visible.</span></h1><p>ProjectPulse brings projects, people, and priorities together so every team can plan with confidence and finish meaningful work.</p><div className="hero-actions"><Link to="/register" className="button button-primary">Start planning <ArrowRight size={16} /></Link><Link to="/login" className="button button-secondary">Sign in</Link></div><div className="preview-window"><div className="preview-bar"><span /><span /><span /><small>ProjectPulse workspace</small></div><div className="preview-body"><div className="preview-sidebar"><b>ProjectPulse</b><span className="active">Overview</span><span>Projects</span><span>Tasks</span><span>Reports</span></div><div className="preview-content"><small>WORKSPACE OVERVIEW</small><h3>Plan with clarity</h3><div className="preview-stats"><span /><span /><span /></div><div className="preview-panels"><span /><span /></div></div></div></div></main><section className="landing-features">{[['Projects', FolderKanban, 'Keep every initiative organized and moving.'], ['Tasks', ClipboardList, 'Turn goals into clear, accountable next steps.'], ['Team', Users, 'Give everyone context without the noise.'], ['Insights', Activity, 'See momentum and make better decisions.']].map(([name, Icon, text]) => <div key={name}><Icon size={20} /><h3>{name}</h3><p>{text}</p></div>)}</section></div>
}

function AuthPage({ mode }) {
  const isLogin = mode === 'login'
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'MEMBER' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!form.email || !form.password || (!isLogin && (!form.name || !form.confirmPassword))) return setError('Please complete all required fields.')
    if (!isLogin && form.password !== form.confirmPassword) return setError('Passwords do not match.')
    setSubmitting(true)
    try {
      if (isLogin) { await login({ email: form.email, password: form.password }); navigate('/dashboard') }
      else { await register({ name: form.name, email: form.email, password: form.password, role: form.role }); navigate('/login', { state: { registered: true } }) }
    } catch (requestError) {
      setError(requestError.response?.data?.message || (isLogin ? 'Invalid email or password.' : 'Unable to create your account. Please try again.'))
    } finally { setSubmitting(false) }
  }

  return <div className="auth-page"><div className="auth-brand"><Link to="/" className="brand"><span className="brand-mark">P</span><span>Project<span className="brand-accent">Pulse</span></span></Link><div className="auth-message"><div className="eyebrow">Your work, in focus</div><h1>{isLogin ? 'Welcome back to your workspace.' : 'Build momentum with your team.'}</h1><p>Plan clearly, collaborate simply, and keep every deadline visible.</p><div className="auth-quote"><CheckCircle2 size={18} /><span>Everything your team needs to move forward.</span></div></div></div><div className="auth-panel"><div className="auth-card"><div className="auth-heading"><h2>{isLogin ? 'Sign in' : 'Create your account'}</h2><p>{isLogin ? 'Enter your details to continue.' : 'Start organizing your work in minutes.'}</p></div><form onSubmit={submit}>{!isLogin && <label>Full name<input name="name" value={form.name} onChange={update} placeholder="Your name" autoComplete="name" /></label>}<label>Email address<input name="email" type="email" value={form.email} onChange={update} placeholder="you@company.com" autoComplete="email" /></label><label>Password<input name="password" type="password" value={form.password} onChange={update} placeholder="At least 6 characters" autoComplete={isLogin ? 'current-password' : 'new-password'} /></label>{!isLogin && <><label>Confirm password<input name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} placeholder="Repeat your password" autoComplete="new-password" /></label><label>Role<select name="role" value={form.role} onChange={update}><option value="MEMBER">Member</option><option value="PROJECT_MANAGER">Project manager</option></select></label></>}{error && <div className="form-error"><XCircle size={16} />{error}</div>}<Button type="submit" disabled={submitting}>{submitting ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></Button></form><p className="auth-switch">{isLogin ? "Don't have an account?" : 'Already have an account?'} <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create one' : 'Sign in'}</Link></p></div></div></div>
}

function ProjectError({ message }) {
  return message ? <div className="form-error"><XCircle size={16} />{message}</div> : null
}

function ProjectsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadProjects() {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/api/projects', { params: { search: query || undefined, status: status || undefined } })
      setItems(response.data.projects || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProjects() }, [query, status])

  async function deleteProject(id) {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    try {
      await api.delete(`/api/projects/${id}`)
      setItems((current) => current.filter((project) => project._id !== id))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete project.')
    }
  }

  const canManage = user?.role === 'PROJECT_MANAGER'
  return <><PageHeader eyebrow="Workspace" title="Projects" description="Manage your team's work in one place." action={canManage && <Link to="/projects/new" className="button button-primary"><Plus size={16} />New project</Link>} /><div className="toolbar"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="PLANNED">Planned</option><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option></select></div><ProjectError message={error} />{loading ? <div className="loading-screen"><div className="spinner" />Loading projects...</div> : items.length === 0 ? <Card><EmptyState title="No projects yet" description="Create a project to start organizing your team's work." action={canManage && <Link to="/projects/new" className="button button-primary">Create project</Link>} /></Card> : <div className="project-card-grid">{items.map((project) => <Card className="project-card" key={project._id}><div className="project-card-top"><div className="project-avatar large">{project.name[0]}</div><div><Link className="more-button" to={`/projects/${project._id}/edit`}><MoreHorizontal size={18} /></Link>{canManage && <button className="more-button" onClick={() => deleteProject(project._id)} title="Delete project"><X size={16} /></button>}</div></div><Badge tone={project.status}>{project.status}</Badge><h2><Link to={`/projects/${project._id}`}>{project.name}</Link></h2><p>{project.description || 'No description provided.'}</p><div className="project-progress"><div><span>Progress</span><strong>Project</strong></div><ProgressBar value={project.status === 'COMPLETED' ? 100 : project.status === 'ACTIVE' ? 50 : 0} /></div><div className="project-meta"><span><Users size={15} />{project.members?.length || 0} members</span><span><CalendarDays size={15} />{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span></div></Card>)}</div>}</>
}

function TasksPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState({ status: '', priority: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const canManage = user?.role === 'PROJECT_MANAGER'
  async function loadTasks() {
    setLoading(true)
    try {
      const { data } = await api.get('/api/tasks', { params: { status: filters.status || undefined, priority: filters.priority || undefined } })
      setItems(data.tasks || [])
      setError('')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load tasks.') } finally { setLoading(false) }
  }
  useEffect(() => { loadTasks() }, [filters.status, filters.priority])
  async function updateStatus(task, status) {
    try { const { data } = await api.patch(`/api/tasks/${task._id}`, { status }); setItems((current) => current.map((item) => item._id === task._id ? data.task : item)) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to update task.') }
  }
  async function deleteTask(id) {
    if (!window.confirm('Delete this task?')) return
    try { await api.delete(`/api/tasks/${id}`); setItems((current) => current.filter((task) => task._id !== id)) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete task.') }
  }
  return <><PageHeader eyebrow="Workspace" title="Tasks" description="Keep priorities clear and work moving." action={canManage && <Button icon={Plus} onClick={() => navigate('/tasks/new')}>New task</Button>} /><div className="toolbar"><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All statuses</option><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select><select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}><option value="">All priorities</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select></div><ProjectError message={error} />{loading ? <div className="loading-screen"><div className="spinner" />Loading tasks...</div> : items.length === 0 ? <Card><EmptyState title="No tasks found" description="Create a task or adjust your filters to see work here." /></Card> : <Card className="table-card"><div className="data-table"><div className="table-row table-head"><span>Task</span><span>Project</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Due date</span></div>{items.map((task) => <div className="table-row" key={task._id}><span className="task-title"><span className={`task-check ${task.status === 'COMPLETED' ? 'done' : ''}`}>{task.status === 'COMPLETED' && <Check size={12} />}</span><Link to={`/tasks/${task._id}`}><strong>{task.title}</strong></Link></span><span>{task.project?.name}</span><span className="assignee"><Avatar name={task.assignedTo?.name || 'User'} size="sm" />{task.assignedTo?.name}</span><span><Badge tone={task.priority}>{task.priority}</Badge></span><span>{canManage || task.assignedTo?._id === user?.id ? <select className="inline-select" value={task.status} onChange={(event) => updateStatus(task, event.target.value)}><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select> : <Badge tone={task.status}>{task.status.replace('_', ' ')}</Badge>}</span><span>{new Date(task.dueDate).toLocaleDateString()}</span>{canManage && <button className="more-button" onClick={() => deleteTask(task._id)}><X size={15} /></button>}</div>)}</div></Card>}</>
}

function TaskForm({ edit = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [projectsList, setProjectsList] = useState([])
  const [form, setForm] = useState({ title: '', description: '', project: '', assignedTo: '', status: 'TODO', priority: 'MEDIUM', dueDate: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(edit)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    Promise.all([api.get('/api/projects'), edit ? api.get(`/api/tasks/${id}`) : Promise.resolve(null)]).then(([projectsResponse, taskResponse]) => {
      setProjectsList(projectsResponse.data.projects || [])
      if (taskResponse) {
        const task = taskResponse.data.task
        setForm({ title: task.title, description: task.description || '', project: task.project?._id, assignedTo: task.assignedTo?._id, status: task.status, priority: task.priority, dueDate: task.dueDate?.slice(0, 10) })
      }
    }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load task form.')).finally(() => setLoading(false))
  }, [edit, id])
  const selectedProject = projectsList.find((project) => project._id === form.project)
  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }) }
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError('')
    try { const response = edit ? await api.put(`/api/tasks/${id}`, form) : await api.post('/api/tasks', form); navigate(`/tasks/${response.data.task._id}`) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save task.') } finally { setSaving(false) }
  }
  if (loading) return <div className="loading-screen"><div className="spinner" />Loading task...</div>
  return <><PageHeader eyebrow="Workspace" title={edit ? 'Edit task' : 'New task'} description="Create a clear, accountable next step." /><Card className="form-card"><form onSubmit={submit}><label>Title<input name="title" value={form.title} onChange={update} required placeholder="Task title" /></label><label>Description<textarea name="description" value={form.description} onChange={update} rows="4" placeholder="Add context" /></label><label>Project<select name="project" value={form.project} onChange={(event) => setForm({ ...form, project: event.target.value, assignedTo: '' })} required><option value="">Select project</option>{projectsList.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}</select></label><label>Assigned member<select name="assignedTo" value={form.assignedTo} onChange={update} required><option value="">Select member</option>{selectedProject?.members?.map((member) => <option key={member._id} value={member._id}>{member.name} ({member.email})</option>)}</select></label><div className="form-row"><label>Priority<select name="priority" value={form.priority} onChange={update}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label><label>Due date<input name="dueDate" value={form.dueDate} onChange={update} type="date" required /></label></div><ProjectError message={error} /><Button type="submit" disabled={saving}>{saving ? 'Saving...' : edit ? 'Save changes' : 'Create task'}</Button></form></Card></>
}

function TaskDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get(`/api/tasks/${id}`).then(({ data }) => setTask(data.task)).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load task.')) }, [id])
  async function deleteTask() { if (!window.confirm('Delete this task?')) return; try { await api.delete(`/api/tasks/${id}`); navigate('/tasks') } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete task.') } }
  if (!task) return error ? <ProjectError message={error} /> : <div className="loading-screen"><div className="spinner" />Loading task...</div>
  const canManage = user?.role === 'PROJECT_MANAGER'
  return <><PageHeader eyebrow="Task details" title={task.title} description={task.description || 'No description provided.'} action={<div className="hero-actions">{canManage && <Link to={`/tasks/${id}/edit`} className="button button-secondary">Edit task</Link>}{canManage && <Button variant="danger" onClick={deleteTask}>Delete</Button>}</div>} /><Card className="detail-card"><div className="section-heading"><h2>Task information</h2><Badge tone={task.status}>{task.status.replace('_', ' ')}</Badge></div><div className="project-meta"><span>Project: {task.project?.name}</span><span>Priority: {task.priority}</span><span>Assigned to: {task.assignedTo?.name}</span><span>Due: {new Date(task.dueDate).toLocaleDateString()}</span></div></Card></>
}

function KanbanCard({ task, overlay = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task._id })
  const style = transform && !overlay ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
  return <Card ref={setNodeRef} style={style} className={`kanban-card ${isDragging ? 'kanban-dragging' : ''} ${overlay ? 'kanban-overlay' : ''}`} {...listeners} {...attributes}><div className="kanban-card-top"><Badge tone={task.priority}>{task.priority}</Badge><MoreHorizontal size={17} /></div><h3><Link to={`/tasks/${task._id}`}>{task.title}</Link></h3><p>{task.project?.name}</p><div className="kanban-card-foot"><span className="assignee"><Avatar name={task.assignedTo?.name || 'User'} size="sm" />{task.assignedTo?.name}</span><span><CalendarDays size={14} />{new Date(task.dueDate).toLocaleDateString()}</span></div></Card>
}

function KanbanColumn({ status, label, tasks: columnTasks }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return <div ref={setNodeRef} className={`kanban-column ${isOver ? 'kanban-column-over' : ''}`}><div className="kanban-heading"><span><i className={`column-dot ${status.toLowerCase()}`} />{label}</span><small>{columnTasks.length}</small></div>{columnTasks.map((task) => <KanbanCard task={task} key={task._id} />)}{columnTasks.length === 0 && <div className="kanban-empty">Drop tasks here</div>}</div>
}

function KanbanPage() {
  const navigate = useNavigate()
  const columns = [['TODO', 'To do'], ['IN_PROGRESS', 'In progress'], ['COMPLETED', 'Completed']]
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTask, setActiveTask] = useState(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  useEffect(() => {
    api.get('/api/tasks').then(({ data }) => setItems(data.tasks || []))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load tasks.'))
      .finally(() => setLoading(false))
  }, [])
  async function moveTask(task, status) {
    const previous = items
    setItems((current) => current.map((item) => item._id === task._id ? { ...item, status } : item))
    try {
      const { data } = await api.patch(`/api/tasks/${task._id}`, { status })
      setItems((current) => current.map((item) => item._id === task._id ? data.task : item))
    } catch (requestError) {
      setItems(previous)
      setError(requestError.response?.data?.message || 'Unable to update task status.')
    }
  }

  function onDragStart({ active }) {
    setActiveTask(items.find((task) => task._id === active.id) || null)
  }

  function onDragEnd({ active, over }) {
    setActiveTask(null)
    const task = items.find((item) => item._id === active.id)
    if (task && over && columns.some(([status]) => status === over.id) && task.status !== over.id) {
      moveTask(task, over.id)
    }
  }
  if (loading) return <div className="loading-screen"><div className="spinner" />Loading board...</div>
  return <><PageHeader eyebrow="Workspace" title="Kanban" description="Drag tasks between columns to update their status." action={<Button icon={Plus} onClick={() => navigate('/tasks/new')}>New task</Button>} /><ProjectError message={error} />{items.length === 0 ? <Card><EmptyState title="No tasks yet" description="Create a task to start using your board." action={<Button onClick={() => navigate('/tasks/new')}>Create task</Button>} /></Card> : <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}><div className="kanban-board">{columns.map(([status, label]) => <KanbanColumn key={status} status={status} label={label} tasks={items.filter((task) => task.status === status)} />)}</div><DragOverlay>{activeTask ? <KanbanCard task={activeTask} overlay /> : null}</DragOverlay></DndContext>}</>
}

function IssuesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState({ status: '', severity: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const canManage = user?.role === 'PROJECT_MANAGER'
  async function loadIssues() {
    setLoading(true)
    try { const { data } = await api.get('/api/issues', { params: { status: filters.status || undefined, severity: filters.severity || undefined } }); setItems(data.issues || []); setError('') } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load issues.') } finally { setLoading(false) }
  }
  useEffect(() => { loadIssues() }, [filters.status, filters.severity])
  async function deleteIssue(id) {
    if (!window.confirm('Delete this issue?')) return
    try { await api.delete(`/api/issues/${id}`); setItems((current) => current.filter((issue) => issue._id !== id)) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete issue.') }
  }
  return <><PageHeader eyebrow="Workspace" title="Issues" description="Resolve blockers before they slow your team down." action={<Button variant="danger" icon={Plus} onClick={() => navigate('/issues/new')}>Report issue</Button>} /><div className="toolbar"><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All statuses</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select><select value={filters.severity} onChange={(event) => setFilters({ ...filters, severity: event.target.value })}><option value="">All severity</option><option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select></div><ProjectError message={error} />{loading ? <div className="loading-screen"><div className="spinner" />Loading issues...</div> : items.length === 0 ? <Card><EmptyState title="No issues found" description="Report an issue when something needs attention." action={<Button variant="danger" onClick={() => navigate('/issues/new')}>Report issue</Button>} /></Card> : <Card className="table-card"><div className="data-table"><div className="table-row issue-head"><span>Issue</span><span>Project</span><span>Reported by</span><span>Assignee</span><span>Severity</span><span>Status</span></div>{items.map((issue) => <div className="table-row" key={issue._id}><span className="task-title"><span className="issue-marker"><CircleAlert size={15} /></span><Link to={`/issues/${issue._id}`}><strong>{issue.title}</strong></Link></span><span>{issue.project?.name}</span><span>{issue.reportedBy?.name}</span><span>{issue.assignedTo?.name || 'Unassigned'}</span><span><Badge tone={issue.severity}>{issue.severity}</Badge></span><span><Badge tone={issue.status}>{issue.status.replace('_', ' ')}</Badge></span>{canManage && <button className="more-button" onClick={() => deleteIssue(issue._id)}><X size={15} /></button>}</div>)}</div></Card>}</>
}

function IssueForm({ edit = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [projectsList, setProjectsList] = useState([])
  const [tasksList, setTasksList] = useState([])
  const [form, setForm] = useState({ title: '', description: '', project: '', task: '', assignedTo: '', severity: 'MEDIUM', status: 'OPEN' })
  const [loading, setLoading] = useState(edit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all([api.get('/api/projects'), api.get('/api/tasks'), edit ? api.get(`/api/issues/${id}`) : Promise.resolve(null)]).then(([projectsResponse, tasksResponse, issueResponse]) => {
      setProjectsList(projectsResponse.data.projects || [])
      setTasksList(tasksResponse.data.tasks || [])
      if (issueResponse) {
        const issue = issueResponse.data.issue
        setForm({ title: issue.title, description: issue.description || '', project: issue.project?._id, task: issue.task?._id || '', assignedTo: issue.assignedTo?._id || '', severity: issue.severity, status: issue.status })
      }
    }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load issue form.')).finally(() => setLoading(false))
  }, [edit, id])
  const selectedProject = projectsList.find((project) => project._id === form.project)
  const projectTasks = tasksList.filter((task) => task.project?._id === form.project)
  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }) }
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError('')
    const payload = { ...form, task: form.task || undefined, assignedTo: form.assignedTo || undefined }
    try { const response = edit ? await api.put(`/api/issues/${id}`, payload) : await api.post('/api/issues', payload); navigate(`/issues/${response.data.issue._id}`) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save issue.') } finally { setSaving(false) }
  }
  if (loading) return <div className="loading-screen"><div className="spinner" />Loading issue...</div>
  return <><PageHeader eyebrow="Workspace" title={edit ? 'Edit issue' : 'Report an issue'} description="Capture a blocker so the right person can resolve it." /><Card className="form-card"><form onSubmit={submit}><label>Title<input name="title" value={form.title} onChange={update} required placeholder="Issue title" /></label><label>Description<textarea name="description" value={form.description} onChange={update} rows="4" placeholder="Describe the issue" /></label><label>Project<select name="project" value={form.project} onChange={(event) => setForm({ ...form, project: event.target.value, task: '', assignedTo: '' })} required><option value="">Select project</option>{projectsList.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}</select></label><label>Related task<select name="task" value={form.task} onChange={update}><option value="">No related task</option>{projectTasks.map((task) => <option key={task._id} value={task._id}>{task.title}</option>)}</select></label><label>Assigned member<select name="assignedTo" value={form.assignedTo} onChange={update}><option value="">Unassigned</option>{selectedProject?.members?.map((member) => <option key={member._id} value={member._id}>{member.name}</option>)}</select></label><div className="form-row"><label>Severity<select name="severity" value={form.severity} onChange={update}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label><label>Status<select name="status" value={form.status} onChange={update}><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select></label></div><ProjectError message={error} /><Button type="submit" variant="danger" disabled={saving}>{saving ? 'Saving...' : edit ? 'Save changes' : 'Report issue'}</Button></form></Card></>
}

function IssueDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [issue, setIssue] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get(`/api/issues/${id}`).then(({ data }) => setIssue(data.issue)).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load issue.')) }, [id])
  async function deleteIssue() { if (!window.confirm('Delete this issue?')) return; try { await api.delete(`/api/issues/${id}`); navigate('/issues') } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete issue.') } }
  if (!issue) return error ? <ProjectError message={error} /> : <div className="loading-screen"><div className="spinner" />Loading issue...</div>
  const canManage = user?.role === 'PROJECT_MANAGER'
  return <><PageHeader eyebrow="Issue details" title={issue.title} description={issue.description || 'No description provided.'} action={<div className="hero-actions">{canManage && <Link to={`/issues/${id}/edit`} className="button button-secondary">Edit issue</Link>}{canManage && <Button variant="danger" onClick={deleteIssue}>Delete</Button>}</div>} /><Card className="detail-card"><div className="section-heading"><h2>Issue information</h2><Badge tone={issue.status}>{issue.status.replace('_', ' ')}</Badge></div><div className="project-meta"><span>Project: {issue.project?.name}</span><span>Severity: {issue.severity}</span><span>Reported by: {issue.reportedBy?.name}</span><span>Assigned to: {issue.assignedTo?.name || 'Unassigned'}</span>{issue.task && <span>Task: {issue.task.title}</span>}</div></Card></>
}

function ReportsPage() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReports() {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/reports')
        setReports(data.reports)
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load reports.')
      } finally {
        setLoading(false)
      }
    }
    loadReports()
  }, [])

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Insights" title="Reports" description="A clear view of progress across your workspace." action={<Button variant="secondary">This month <ChevronDown size={15} /></Button>} />
        <div className="loading-screen"><div className="spinner" />Loading reports...</div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader eyebrow="Insights" title="Reports" description="A clear view of progress across your workspace." action={<Button variant="secondary">This month <ChevronDown size={15} /></Button>} />
        <ProjectError message={error} />
      </>
    )
  }

  if (!reports) {
    return (
      <>
        <PageHeader eyebrow="Insights" title="Reports" description="A clear view of progress across your workspace." action={<Button variant="secondary">This month <ChevronDown size={15} /></Button>} />
        <Card><EmptyState title="No data available" description="Create projects, tasks, and issues to see insights here." /></Card>
      </>
    )
  }

  const { projects, tasks, issues, projectProgress } = reports

  const taskStatusData = [
    { name: 'To do', value: tasks.todo },
    { name: 'In progress', value: tasks.inProgress },
    { name: 'Completed', value: tasks.completed },
  ]

  return (
    <>
      <PageHeader eyebrow="Insights" title="Reports" description="A clear view of progress across your workspace." action={<Button variant="secondary">This month <ChevronDown size={15} /></Button>} />
      <div className="stat-grid compact-stats">
        {[['Total projects', projects.total], ['Active projects', projects.active], ['Completed projects', projects.completed], ['Total tasks', tasks.total], ['To do', tasks.todo], ['In progress', tasks.inProgress], ['Completed tasks', tasks.completed], ['Total issues', issues.total], ['Open issues', issues.open], ['Resolved issues', issues.resolved]].map(([label, value]) => (
          <Card className="mini-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>Across all projects</small>
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
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={taskStatusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8ebf0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#5966d8" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="section-heading">
            <div>
              <h2>Tasks by priority</h2>
              <p>Where attention is needed</p>
            </div>
          </div>
          <div className="donut-chart">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie data={tasks.byPriority} dataKey="value" innerRadius={55} outerRadius={82} paddingAngle={4}>
                  {tasks.byPriority.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
      <Card>
        <div className="section-heading">
          <div>
            <h2>Issues by severity</h2>
            <p>Issues requiring attention</p>
          </div>
        </div>
        <div className="donut-chart">
          <ResponsiveContainer width="55%" height={220}>
            <PieChart>
              <Pie data={issues.bySeverity} dataKey="value" innerRadius={55} outerRadius={82} paddingAngle={4}>
                {issues.bySeverity.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
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
      <Card>
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
            <EmptyState title="No projects yet" description="Create a project to track progress." />
          )}
        </div>
      </Card>
    </>
  )
}

function TeamPage() {
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTeam() {
      setLoading(true)
      setError('')
      try {
        const [usersResponse, tasksResponse, projectsResponse] = await Promise.all([
          api.get('/api/users'),
          api.get('/api/tasks'),
          api.get('/api/projects'),
        ])
        setMembers(usersResponse.data.users || [])
        setTasks(tasksResponse.data.tasks || [])
        setProjects(projectsResponse.data.projects || [])
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load team.')
      } finally {
        setLoading(false)
      }
    }
    loadTeam()
  }, [])

  function countMemberTasks(memberId) {
    return tasks.filter((task) => task.assignedTo?._id === memberId || task.assignedTo === memberId).length
  }

  function countMemberProjects(memberId) {
    return projects.filter((project) => project.manager?._id === memberId || project.manager === memberId || project.members?.some((member) => member._id === memberId || member === memberId)).length
  }

  if (loading) return <div className="loading-screen"><div className="spinner" />Loading team...</div>

  return <><PageHeader eyebrow="Workspace" title="Team" description="See who is working on what." action={<Button icon={Plus}>Invite member</Button>} /><ProjectError message={error} />{members.length === 0 ? <Card><EmptyState title="No team members yet" description="Registered workspace users will appear here." /></Card> : <div className="member-grid">{members.map((member) => { const roleLabel = member.role === 'PROJECT_MANAGER' ? 'Project manager' : 'Member'; return <Card className="member-card" key={member._id || member.email}><Avatar name={member.name} size="lg" /><h2>{member.name}</h2><p>{member.email}</p><Badge tone={member.role === 'PROJECT_MANAGER' ? 'active' : 'neutral'}>{roleLabel}</Badge><div className="member-stats"><span><strong>{countMemberTasks(member._id)}</strong> tasks</span><span><strong>{countMemberProjects(member._id)}</strong> projects</span></div></Card> })}</div>}</>
}

function ProfilePage() {
  const { user } = useAuth()
  return <><PageHeader eyebrow="Account" title="Profile" description="Your account details and workspace role." /><Card className="profile-card"><Avatar name={user?.name || 'Workspace user'} size="xl" /><div><div className="eyebrow">Personal profile</div><h2>{user?.name || 'Workspace user'}</h2><p>{user?.email || 'No email available'}</p><Badge tone="active">{user?.role === 'PROJECT_MANAGER' ? 'Project manager' : 'Member'}</Badge></div></Card></>
}

function ProjectForm({ edit = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '', startDate: '', deadline: '', status: 'PLANNED' })
  const [loading, setLoading] = useState(edit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!edit) return
    api.get(`/api/projects/${id}`).then(({ data }) => {
      const project = data.project
      setForm({ name: project.name || '', description: project.description || '', startDate: project.startDate?.slice(0, 10) || '', deadline: project.deadline?.slice(0, 10) || '', status: project.status || 'PLANNED' })
    }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load project.')).finally(() => setLoading(false))
  }, [edit, id])

  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }) }
  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = edit ? await api.put(`/api/projects/${id}`, form) : await api.post('/api/projects', form)
      navigate(`/projects/${response.data.project._id}`)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save project.')
    } finally { setSaving(false) }
  }
  if (loading) return <div className="loading-screen"><div className="spinner" />Loading project...</div>
  return <><PageHeader eyebrow="Workspace" title={edit ? 'Edit project' : 'New project'} description={edit ? 'Update project details and keep your team aligned.' : 'Set up a clear home for your next initiative.'} /><Card className="form-card"><form onSubmit={submit}><label>Name<input name="name" value={form.name} onChange={update} required placeholder="Project name" /></label><label>Description<textarea name="description" value={form.description} onChange={update} rows="4" placeholder="Add a short description" /></label><div className="form-row"><label>Start date<input name="startDate" value={form.startDate} onChange={update} type="date" /></label><label>Deadline<input name="deadline" value={form.deadline} onChange={update} type="date" /></label></div><label>Status<select name="status" value={form.status} onChange={update}><option value="PLANNED">Planned</option><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option></select></label><ProjectError message={error} /><Button type="submit" disabled={saving}>{saving ? 'Saving...' : edit ? 'Save changes' : 'Create project'}</Button></form></Card></>
}

function FormPage({ title, description }) {
  return <><PageHeader eyebrow="Workspace" title={title} description={description} /><Card className="form-card"><label>Name<input placeholder="Enter a name" /></label><label>Description<textarea placeholder="Add a short description" rows="4" /></label><div className="form-row"><label>Start date<input type="date" /></label><label>Deadline<input type="date" /></label></div><Button>Save draft</Button></Card></>
}

function MilestoneForm({ projectId, initialData, onSubmit, onCancel }) {
  const edit = !!initialData
  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    dueDate: initialData?.dueDate ? initialData.dueDate.slice(0, 10) : '',
    status: initialData?.status || 'PLANNED',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(edit)

  if (edit) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="milestone-form">
        <div className="form-row">
          <label>Name<input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Milestone name" /></label>
          <label>Due date<input name="dueDate" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} type="date" required /></label>
        </div>
        <label>Description<textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="2" placeholder="Add a short description" /></label>
        <label>Status<select name="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="PLANNED">Planned</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option></select></label>
        {error && <div className="form-error"><XCircle size={16} />{error}</div>}
        <div className="form-actions">
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
          <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    )
  }

  if (!showForm) {
    return <Button icon={Plus} onClick={() => setShowForm(true)}>Create milestone</Button>
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="milestone-form">
      <div className="form-row">
        <label>Name<input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Milestone name" autoFocus /></label>
        <label>Due date<input name="dueDate" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} type="date" required /></label>
      </div>
      <label>Description<textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="2" placeholder="Add a short description" /></label>
      <label>Status<select name="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="PLANNED">Planned</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option></select></label>
      {error && <div className="form-error"><XCircle size={16} />{error}</div>}
      <div className="form-actions">
        <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create milestone'}</Button>
        <Button variant="secondary" type="button" onClick={() => { setShowForm(false); setForm({ name: '', description: '', dueDate: '', status: 'PLANNED' }) }}>Cancel</Button>
      </div>
    </form>
  )
}

function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [milestonesLoading, setMilestonesLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/projects/${id}`)
      .then(({ data }) => setProject(data.project))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load project.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    setMilestonesLoading(true)
    api.get(`/api/projects/${id}/milestones`)
      .then(({ data }) => setMilestones(data.milestones || []))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load milestones.'))
      .finally(() => setMilestonesLoading(false))
  }, [id])

  async function addMember(event) {
    event.preventDefault()
    try {
      const { data } = await api.post(`/api/projects/${id}/members`, { email })
      setProject(data.project)
      setEmail('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to add member.')
    }
  }

  async function removeMember(memberId) {
    try {
      const { data } = await api.delete(`/api/projects/${id}/members/${memberId}`)
      setProject(data.project)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to remove member.')
    }
  }

  async function createMilestone(milestoneData) {
    try {
      const { data } = await api.post(`/api/projects/${id}/milestones`, { ...milestoneData, project: id })
      setMilestones((current) => [...current, data.milestone].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create milestone.')
      throw requestError
    }
  }

  async function updateMilestone(milestoneId, milestoneData) {
    try {
      const { data } = await api.put(`/api/projects/${id}/milestones/${milestoneId}`, milestoneData)
      setMilestones((current) =>
        current.map((m) => (m._id === milestoneId ? data.milestone : m))
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      )
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update milestone.')
      throw requestError
    }
  }

  async function deleteMilestone(milestoneId) {
    if (!window.confirm('Delete this milestone?')) return
    try {
      await api.delete(`/api/projects/${id}/milestones/${milestoneId}`)
      setMilestones((current) => current.filter((m) => m._id !== milestoneId))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete milestone.')
    }
  }

  if (loading) return <div className="loading-screen"><div className="spinner" />Loading project...</div>
  if (!project) return <ProjectError message={error || 'Project not found.'} />

  const canManage = user?.role === 'PROJECT_MANAGER' && project.manager?._id === user.id

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString()
  }

  function getStatusBadgeTone(status) {
    switch (status) {
      case 'COMPLETED':
        return 'completed'
      case 'IN_PROGRESS':
        return 'active'
      default:
        return 'planned'
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Project overview"
        title={project.name}
        description={project.description || 'No description provided.'}
        action={canManage && <Link to={`/projects/${id}/edit`} className="button button-secondary">Edit project</Link>}
      />
      <ProjectError message={error} />
      <div className="detail-grid">
        <Card>
          <div className="section-heading">
            <h2>Overview</h2>
            <Badge tone={project.status}>{project.status}</Badge>
          </div>
          <p className="detail-copy">Created {new Date(project.createdAt).toLocaleDateString()} · Managed by {project.manager?.name || 'Unknown'}</p>
          <div className="detail-progress">
            <div><span>Status</span><strong>{project.status}</strong></div>
            <ProgressBar value={project.status === 'COMPLETED' ? 100 : project.status === 'ACTIVE' ? 50 : 0} />
          </div>
        </Card>
        <Card>
          <div className="section-heading"><h2>Members</h2><Users size={18} /></div>
          {canManage && <form className="member-form" onSubmit={addMember}><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="member@example.com" /><Button type="submit">Add</Button></form>}
          <div className="activity-list">
            {project.members?.map((member) => (
              <div className="activity-row" key={member._id}>
                <Avatar name={member.name} size="sm" />
                <div><strong>{member.name}</strong><small>{member.email}</small></div>
                {canManage && member._id !== project.manager?._id && <button className="more-button" onClick={() => removeMember(member._id)}><X size={15} /></button>}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="section-heading">
            <h2>Milestones</h2>
            <Target size={18} />
            {canManage && (
              <MilestoneForm
                projectId={id}
                onSubmit={createMilestone}
                onCancel={() => {}}
              />
            )}
          </div>
          {milestonesLoading ? (
            <div className="loading-screen"><div className="spinner" />Loading milestones...</div>
          ) : milestones.length === 0 ? (
            <EmptyState
              title="No milestones yet"
              description={canManage ? 'Create a milestone to track key project deliverables.' : 'This project has no milestones yet.'}
              action={canManage && <Button icon={Plus} size="sm">Create milestone</Button>}
            />
          ) : (
            <div className="milestone-list">
              {milestones.map((milestone) => (
                <div className="milestone-item" key={milestone._id}>
                  <div className="milestone-main">
                    <div className="milestone-header">
                      <strong>{milestone.name}</strong>
                      <Badge tone={getStatusBadgeTone(milestone.status)}>{milestone.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="milestone-description">{milestone.description || 'No description'}</p>
                    <div className="milestone-meta">
                      <span><CalendarDays size={14} /> Due: {formatDate(milestone.dueDate)}</span>
                      <span><Users size={14} /> Created by: {milestone.createdBy?.name || 'Unknown'}</span>
                    </div>
                  </div>
                  {canManage && (
                    <div className="milestone-actions">
                      <MilestoneForm
                        projectId={id}
                        initialData={milestone}
                        onSubmit={(data) => updateMilestone(milestone._id, data)}
                        onCancel={() => {}}
                      />
                      <button className="more-button" onClick={() => deleteMilestone(milestone._id)} title="Delete milestone">
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
  )
}

function SearchPage() {
  const location = useLocation()
  const initialQuery = useMemo(() => new URLSearchParams(location.search).get('q') || '', [location.search])
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState({ projects: [], tasks: [], issues: [], users: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(nextQuery = query) {
    const trimmed = nextQuery.trim()
    if (!trimmed) {
      setResults({ projects: [], tasks: [], issues: [], users: [] })
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/api/search', { params: { q: trimmed } })
      setResults({
        projects: response.data.projects || [],
        tasks: response.data.tasks || [],
        issues: response.data.issues || [],
        users: response.data.users || [],
      })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to search.')
      setResults({ projects: [], tasks: [], issues: [], users: [] })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery)
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  const hasResults = results.projects.length + results.tasks.length + results.issues.length + results.users.length > 0

  function renderProject(project) {
    return (
      <Link to={`/projects/${project._id}`} className="search-result-item" key={project._id}>
        <span className="result-type">Project</span>
        <div className="result-main">
          <strong>{project.name}</strong>
          <small>{project.description || 'No description'}</small>
        </div>
        <Badge tone={project.status}>{project.status}</Badge>
      </Link>
    )
  }

  function renderTask(task) {
    return (
      <Link to={`/tasks/${task._id}`} className="search-result-item" key={task._id}>
        <span className="result-type">Task</span>
        <div className="result-main">
          <strong>{task.title}</strong>
          <small>{task.project?.name} · {task.assignedTo?.name}</small>
        </div>
        <Badge tone={task.priority}>{task.priority}</Badge>
      </Link>
    )
  }

  function renderIssue(issue) {
    return (
      <Link to={`/issues/${issue._id}`} className="search-result-item" key={issue._id}>
        <span className="result-type">Issue</span>
        <div className="result-main">
          <strong>{issue.title}</strong>
          <small>{issue.project?.name} · {issue.assignedTo?.name || 'Unassigned'}</small>
        </div>
        <Badge tone={issue.severity}>{issue.severity}</Badge>
      </Link>
    )
  }

  function renderUser(user) {
    return (
      <div className="search-result-item" key={user._id}>
        <span className="result-type">Member</span>
        <div className="result-main">
          <strong>{user.name}</strong>
          <small>{user.email}</small>
        </div>
        <Badge tone={user.role === 'PROJECT_MANAGER' ? 'active' : 'neutral'}>
          {user.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Member'}
        </Badge>
      </div>
    )
  }

  return (
    <>
      <PageHeader eyebrow="Workspace" title="Search" description="Find projects, tasks, issues, and people." />
      <Card className="search-page">
        <label className="search-field large">
          <Search size={19} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            placeholder="Search your workspace..."
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </label>

        {error && <div className="form-error"><XCircle size={16} />{error}</div>}

        {loading ? (
          <div className="loading-screen"><div className="spinner" />Searching...</div>
        ) : !query.trim() ? (
          <EmptyState title="Search your workspace" description="Enter a query to find anything across your projects." />
        ) : !hasResults ? (
          <EmptyState title="No results found" description={`No projects, tasks, issues, or members match "${query}".`} />
        ) : (
          <div className="search-results">
            {results.projects.length > 0 && (
              <div className="search-section">
                <h3>Projects ({results.projects.length})</h3>
                <div className="search-list">{results.projects.map(renderProject)}</div>
              </div>
            )}
            {results.tasks.length > 0 && (
              <div className="search-section">
                <h3>Tasks ({results.tasks.length})</h3>
                <div className="search-list">{results.tasks.map(renderTask)}</div>
              </div>
            )}
            {results.issues.length > 0 && (
              <div className="search-section">
                <h3>Issues ({results.issues.length})</h3>
                <div className="search-list">{results.issues.map(renderIssue)}</div>
              </div>
            )}
            {results.users.length > 0 && (
              <div className="search-section">
                <h3>Members ({results.users.length})</h3>
                <div className="search-list">{results.users.map(renderUser)}</div>
              </div>
            )}
          </div>
        )}
      </Card>
    </>
  )
}

function NotFound() { return <div className="not-found"><XCircle size={42} /><h1>Page not found</h1><p>The page you are looking for does not exist.</p><Link to="/dashboard" className="button button-primary">Back to dashboard</Link></div> }

export default function App() {
  return <Routes>
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
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/tasks/new" element={<TaskForm />} />
      <Route path="/tasks/:id" element={<TaskDetailPage />} />
      <Route path="/tasks/:id/edit" element={<TaskForm edit />} />
      <Route path="/kanban" element={<KanbanPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/team/new" element={<FormPage title="Invite a member" description="Bring another collaborator into your workspace." />} />
      <Route path="/team/:id" element={<TeamPage />} />
      <Route path="/issues" element={<IssuesPage />} />
      <Route path="/issues/new" element={<IssueForm />} />
      <Route path="/issues/:id" element={<IssueDetailPage />} />
      <Route path="/issues/:id/edit" element={<IssueForm edit />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
}
