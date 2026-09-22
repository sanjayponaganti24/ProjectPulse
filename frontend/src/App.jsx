import { forwardRef, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { useAuth } from './context/AuthContext.jsx'
import api from './services/api.js'

const projects = [
  { id: 'atlas', name: 'Atlas Mobile App', description: 'A focused mobile experience for customer teams.', status: 'IN_PROGRESS', progress: 68, deadline: 'Oct 18, 2026', manager: 'Sanjay P.', members: 8, tasks: 24, issues: 3 },
  { id: 'website', name: 'Marketing Website', description: 'A sharper web presence for the next product launch.', status: 'COMPLETED', progress: 100, deadline: 'Sep 30, 2026', manager: 'Maya Chen', members: 5, tasks: 18, issues: 1 },
  { id: 'ops', name: 'Operations Hub', description: 'Bring internal processes into one calm workspace.', status: 'PLANNED', progress: 12, deadline: 'Nov 12, 2026', manager: 'Alex Morgan', members: 4, tasks: 11, issues: 0 },
]

const tasks = [
  { id: 't1', title: 'Finalize onboarding flow', project: 'Atlas Mobile App', assignee: 'Sanjay P.', priority: 'HIGH', status: 'IN_PROGRESS', due: 'Sep 22' },
  { id: 't2', title: 'Review analytics events', project: 'Atlas Mobile App', assignee: 'Maya Chen', priority: 'MEDIUM', status: 'TODO', due: 'Sep 25' },
  { id: 't3', title: 'Publish launch checklist', project: 'Marketing Website', assignee: 'Alex Morgan', priority: 'LOW', status: 'COMPLETED', due: 'Sep 18' },
  { id: 't4', title: 'QA responsive layouts', project: 'Marketing Website', assignee: 'Priya Shah', priority: 'HIGH', status: 'IN_PROGRESS', due: 'Sep 20' },
  { id: 't5', title: 'Map operations workflows', project: 'Operations Hub', assignee: 'Sanjay P.', priority: 'MEDIUM', status: 'TODO', due: 'Oct 02' },
  { id: 't6', title: 'Create support playbook', project: 'Operations Hub', assignee: 'Maya Chen', priority: 'LOW', status: 'COMPLETED', due: 'Sep 17' },
]

const issues = [
  { id: 'i1', title: 'Push notification delay', project: 'Atlas Mobile App', severity: 'HIGH', status: 'OPEN', reporter: 'Maya Chen', assignee: 'Sanjay P.', created: 'Sep 16, 2026' },
  { id: 'i2', title: 'Tablet navigation spacing', project: 'Marketing Website', severity: 'MEDIUM', status: 'IN_PROGRESS', reporter: 'Priya Shah', assignee: 'Alex Morgan', created: 'Sep 14, 2026' },
  { id: 'i3', title: 'Missing empty state copy', project: 'Operations Hub', severity: 'LOW', status: 'RESOLVED', reporter: 'Sanjay P.', assignee: 'Maya Chen', created: 'Sep 12, 2026' },
]

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: ClipboardList },
  { to: '/kanban', label: 'Kanban', icon: Target },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/issues', label: 'Issues', icon: CircleAlert },
  { to: '/reports', label: 'Reports', icon: Activity },
]

function Button({ children, variant = 'primary', icon: Icon, ...props }) {
  return <button className={`button button-${variant}`} {...props}>{Icon && <Icon size={16} />}{children}</button>
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone.toLowerCase().replace('_', '-')}`}>{children}</span>
}

const Card = forwardRef(function Card({ children, className = '', ...props }, ref) {
  return <section ref={ref} className={`card ${className}`} {...props}>{children}</section>
})

function Avatar({ name = 'User', size = 'md' }) {
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  return <span className={`avatar avatar-${size}`}>{initials}</span>
}

function ProgressBar({ value }) {
  return <div className="progress-track"><span style={{ width: `${value}%` }} /></div>
}

function PageHeader({ eyebrow, title, description, action }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
}

function EmptyState({ title, description, action }) {
  return <div className="empty-state"><div className="empty-icon"><FolderKanban size={22} /></div><h3>{title}</h3><p>{description}</p>{action}</div>
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" />Loading your workspace...</div>
  return user ? children : <Navigate to="/login" replace />
}

function AppShell({ children }) {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const title = location.pathname.split('/')[1] || 'dashboard'

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark">P</span><span>Project<span className="brand-accent">Pulse</span></span><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="workspace-switcher"><div className="workspace-mark">A</div><div><strong>Atlas workspace</strong><small>Personal workspace</small></div><ChevronDown size={15} /></div>
      <nav className="sidebar-nav">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-secondary"><NavLink to="/search" className="nav-link"><Search size={18} /><span>Search</span></NavLink><NavLink to="/profile" className="nav-link"><Settings size={18} /><span>Settings</span></NavLink></div>
      <div className="sidebar-user"><Avatar name={user?.name || 'User'} /><div><strong>{user?.name || 'Workspace user'}</strong><small>{user?.role === 'PROJECT_MANAGER' ? 'Project manager' : 'Member'}</small></div><button onClick={handleLogout} title="Log out"><LogOut size={16} /></button></div>
    </aside>
    {mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
    <div className="main-shell">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><div className="topbar-context"><span>Workspace</span><strong>{title.charAt(0).toUpperCase() + title.slice(1)}</strong></div><div className="topbar-actions"><label className="global-search"><Search size={17} /><input placeholder="Search anything..." /><kbd>⌘ K</kbd></label><button className="icon-button" title="Notifications"><Bell size={19} /><i /></button><NavLink to="/profile" className="topbar-avatar"><Avatar name={user?.name || 'User'} /></NavLink></div></header>
      <main className="content">{children}</main>
    </div>
  </div>
}

function ProtectedLayout() {
  return <ProtectedRoute><AppShell><Outlet /></AppShell></ProtectedRoute>
}

function LandingPage() {
  return <div className="landing"><header className="landing-nav"><Link to="/" className="brand"><span className="brand-mark">P</span><span>Project<span className="brand-accent">Pulse</span></span></Link><nav><Link to="/login">Sign in</Link><Link to="/register" className="button button-primary">Get started <ArrowRight size={15} /></Link></nav></header><main className="landing-hero"><div className="eyebrow">A calmer way to work together</div><h1>Make progress <span>visible.</span></h1><p>ProjectPulse brings projects, people, and priorities together so every team can plan with confidence and finish meaningful work.</p><div className="hero-actions"><Link to="/register" className="button button-primary">Start planning <ArrowRight size={16} /></Link><Link to="/login" className="button button-secondary">Sign in</Link></div><div className="preview-window"><div className="preview-bar"><span /><span /><span /><small>ProjectPulse / Dashboard</small></div><div className="preview-body"><div className="preview-sidebar"><b>ProjectPulse</b><span className="active">Overview</span><span>Projects</span><span>Tasks</span><span>Reports</span></div><div className="preview-content"><small>MONDAY, SEPTEMBER 17</small><h3>Good morning, team</h3><div className="preview-stats"><span /><span /><span /></div><div className="preview-panels"><span /><span /></div></div></div></div></main><section className="landing-features">{[['Projects', FolderKanban, 'Keep every initiative organized and moving.'], ['Tasks', ClipboardList, 'Turn goals into clear, accountable next steps.'], ['Team', Users, 'Give everyone context without the noise.'], ['Insights', Activity, 'See momentum and make better decisions.']].map(([name, Icon, text]) => <div key={name}><Icon size={20} /><h3>{name}</h3><p>{text}</p></div>)}</section></div>
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

function Dashboard() {
  return <><PageHeader eyebrow="Monday, September 17, 2026" title="Good morning, team" description="Here's what is happening across your projects today." action={<Button icon={Plus}>New project</Button>} /><div className="stat-grid">{[['Total projects', '12', '+2 this month', FolderKanban], ['Active projects', '7', '+1 this week', Activity], ['Completed', '24', '+8 this month', CheckCircle2], ['Open issues', '9', '3 high priority', CircleAlert]].map(([label, value, note, Icon], index) => <Card className="stat-card" key={label}><div className={`stat-icon stat-${index}`}><Icon size={18} /></div><span>{label}</span><strong>{value}</strong><small>{note}</small></Card>)}</div><div className="dashboard-grid"><Card><div className="section-heading"><div><h2>Project progress</h2><p>Recent momentum across active work.</p></div><Link to="/projects">View all <ArrowRight size={15} /></Link></div><div className="project-list">{projects.map((project) => <Link to={`/projects/${project.id}`} className="project-row" key={project.id}><div className="project-avatar">{project.name[0]}</div><div className="project-row-main"><strong>{project.name}</strong><div><ProgressBar value={project.progress} /><small>{project.progress}% complete</small></div></div><Badge tone={project.status}>{project.status.replace('_', ' ')}</Badge></Link>)}</div></Card><Card><div className="section-heading"><div><h2>Upcoming tasks</h2><p>What needs your attention next.</p></div><Link to="/tasks">View all <ArrowRight size={15} /></Link></div><div className="task-list">{tasks.slice(0, 4).map((task) => <div className="task-row" key={task.id}><span className={`task-check ${task.status === 'COMPLETED' ? 'done' : ''}`}>{task.status === 'COMPLETED' && <Check size={12} />}</span><div><strong>{task.title}</strong><small>{task.project} · Due {task.due}</small></div><Badge tone={task.priority}>{task.priority}</Badge></div>)}</div></Card></div><div className="dashboard-grid lower-grid"><Card><div className="section-heading"><div><h2>Task overview</h2><p>Current workload by status.</p></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height={220}><BarChart data={[{ name: 'To do', value: 18 }, { name: 'In progress', value: 12 }, { name: 'Completed', value: 34 }]}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8ebf0" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#f6f8fb' }} /><Bar dataKey="value" fill="#5966d8" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></Card><Card><div className="section-heading"><div><h2>Recent activity</h2><p>Latest updates from your team.</p></div></div><div className="activity-list">{['Maya completed “Launch checklist”', 'Sanjay moved “Onboarding flow” forward', 'Priya reported a new issue'].map((item, index) => <div className="activity-row" key={item}><Avatar name={['Maya Chen', 'Sanjay P.', 'Priya Shah'][index]} size="sm" /><div><strong>{item}</strong><small>{index + 1} hour{index ? 's' : ''} ago</small></div></div>)}</div></Card></div></>
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
    function onDragStart({ active }) {
      setActiveTask(items.find((task) => task._id === active.id) || null)
    }
    function onDragEnd({ active, over }) {
      setActiveTask(null)
      const task = items.find((item) => item._id === active.id)
      if (task && over && columns.some(([status]) => status === over.id) && task.status !== over.id) moveTask(task, over.id)
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
  const priorityData = [{ name: 'Low', value: 18, color: '#8bb7a4' }, { name: 'Medium', value: 32, color: '#d2a85b' }, { name: 'High', value: 14, color: '#d87979' }]
  return <><PageHeader eyebrow="Insights" title="Reports" description="A clear view of progress across your workspace." action={<Button variant="secondary">This month <ChevronDown size={15} /></Button>} /><div className="stat-grid compact-stats">{[['Total tasks', '64'], ['Completed', '34'], ['In progress', '12'], ['Open issues', '9']].map(([label, value]) => <Card className="mini-stat" key={label}><span>{label}</span><strong>{value}</strong><small>Across all projects</small></Card>)}</div><div className="report-grid"><Card><div className="section-heading"><div><h2>Tasks by status</h2><p>Workload distribution</p></div></div><ResponsiveContainer width="100%" height={260}><BarChart data={[{ name: 'To do', value: 18 }, { name: 'In progress', value: 12 }, { name: 'Completed', value: 34 }]}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8ebf0" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="value" fill="#5966d8" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></Card><Card><div className="section-heading"><div><h2>Tasks by priority</h2><p>Where attention is needed</p></div></div><div className="donut-chart"><ResponsiveContainer width="55%" height={220}><PieChart><Pie data={priorityData} dataKey="value" innerRadius={55} outerRadius={82} paddingAngle={4}>{priorityData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="legend">{priorityData.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}<strong>{item.value}</strong></span>)}</div></div></Card></div><Card><div className="section-heading"><div><h2>Project progress</h2><p>Completion across active projects</p></div></div><div className="report-projects">{projects.map((project) => <div key={project.id}><div><strong>{project.name}</strong><span>{project.progress}%</span></div><ProgressBar value={project.progress} /></div>)}</div></Card></>
}

function TeamPage() {
  const members = [{ name: 'Sanjay Ponaganti', email: 'sanjay@example.com', role: 'Project manager', tasks: 14, projects: 4 }, { name: 'Maya Chen', email: 'maya@example.com', role: 'Member', tasks: 11, projects: 3 }, { name: 'Alex Morgan', email: 'alex@example.com', role: 'Member', tasks: 8, projects: 2 }, { name: 'Priya Shah', email: 'priya@example.com', role: 'Member', tasks: 6, projects: 2 }]
  return <><PageHeader eyebrow="Workspace" title="Team" description="See who is working on what." action={<Button icon={Plus}>Invite member</Button>} /><div className="member-grid">{members.map((member) => <Card className="member-card" key={member.email}><Avatar name={member.name} size="lg" /><h2>{member.name}</h2><p>{member.email}</p><Badge tone={member.role === 'Project manager' ? 'active' : 'neutral'}>{member.role}</Badge><div className="member-stats"><span><strong>{member.tasks}</strong> tasks</span><span><strong>{member.projects}</strong> projects</span></div></Card>)}</div></>
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

function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get(`/api/projects/${id}`).then(({ data }) => setProject(data.project)).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load project.')).finally(() => setLoading(false)) }, [id])
  async function addMember(event) {
    event.preventDefault()
    try { const { data } = await api.post(`/api/projects/${id}/members`, { email }); setProject(data.project); setEmail('') } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to add member.') }
  }
  async function removeMember(memberId) {
    try { const { data } = await api.delete(`/api/projects/${id}/members/${memberId}`); setProject(data.project) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to remove member.') }
  }
  if (loading) return <div className="loading-screen"><div className="spinner" />Loading project...</div>
  if (!project) return <ProjectError message={error || 'Project not found.'} />
  const canManage = user?.role === 'PROJECT_MANAGER' && project.manager?._id === user.id
  return <><PageHeader eyebrow="Project overview" title={project.name} description={project.description || 'No description provided.'} action={canManage && <Link to={`/projects/${id}/edit`} className="button button-secondary">Edit project</Link>} /><ProjectError message={error} /><div className="detail-grid"><Card><div className="section-heading"><h2>Overview</h2><Badge tone={project.status}>{project.status}</Badge></div><p className="detail-copy">Created {new Date(project.createdAt).toLocaleDateString()} · Managed by {project.manager?.name || 'Unknown'}</p><div className="detail-progress"><div><span>Status</span><strong>{project.status}</strong></div><ProgressBar value={project.status === 'COMPLETED' ? 100 : project.status === 'ACTIVE' ? 50 : 0} /></div></Card><Card><div className="section-heading"><h2>Members</h2><Users size={18} /></div>{canManage && <form className="member-form" onSubmit={addMember}><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="member@example.com" /><Button type="submit">Add</Button></form>}<div className="activity-list">{project.members?.map((member) => <div className="activity-row" key={member._id}><Avatar name={member.name} size="sm" /><div><strong>{member.name}</strong><small>{member.email}</small></div>{canManage && member._id !== project.manager?._id && <button className="more-button" onClick={() => removeMember(member._id)}><X size={15} /></button>}</div>)}</div></Card></div></>
}

function SearchPage() {
  return <><PageHeader eyebrow="Workspace" title="Search" description="Find projects, tasks, issues, and people." /><Card className="search-page"><label className="search-field large"><Search size={19} /><input autoFocus placeholder="Search your workspace..." /></label><EmptyState title="Search your workspace" description="Start typing to find anything across your projects." /></Card></>
}

function NotFound() { return <div className="not-found"><XCircle size={42} /><h1>Page not found</h1><p>The page you are looking for does not exist.</p><Link to="/dashboard" className="button button-primary">Back to dashboard</Link></div> }

export default function App() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route element={<ProtectedLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
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
