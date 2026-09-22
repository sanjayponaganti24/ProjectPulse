import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Layers,
  BarChart2,
  Mail,
  CheckSquare,
  FolderKanban,
  Search,
  Plus,
  ArrowRight,
} from 'lucide-react'
import {
  PageHeader,
  Card,
  Badge,
  Avatar,
  AvatarGroup,
  ProgressBar,
  Button,
  LoadingState,
  ErrorState,
} from '../components/UI.jsx'
import api from '../services/api.js'

export function TeamPage() {
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadTeam() {
      setLoading(true)
      try {
        const [uRes, tRes, pRes] = await Promise.all([
          api.get('/api/users').catch(() => ({ data: { users: [] } })),
          api.get('/api/tasks'),
          api.get('/api/projects'),
        ])
        setUsers(uRes.data.users || [])
        setTasks(tRes.data.tasks || [])
        setProjects(pRes.data.projects || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadTeam()
  }, [])

  if (loading) return <LoadingState message="Loading workspace team directory..." />

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        eyebrow="Personnel Directory"
        title="Team Members"
        description="Collaborators, roles, workload commitments, and project assignments."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '6px 12px', width: 240 }}>
            <Search size={14} color="var(--text-light)" />
            <input
              type="text"
              placeholder="Search member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: 12, width: '100%' }}
            />
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map((u) => {
          const userTasks = tasks.filter((t) => t.assignedTo?._id === u._id)
          const userProjects = projects.filter(
            (p) => p.manager?._id === u._id || (p.members || []).some((m) => m._id === u._id)
          )

          return (
            <Card key={u._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 24 }}>
              <Avatar name={u.name} avatar={u.avatar} size="lg" />
              <strong style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>
                {u.name}
              </strong>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Mail size={12} /> {u.email}
              </span>

              <div style={{ margin: '12px 0' }}>
                <Badge tone={u.role === 'PROJECT_MANAGER' ? 'active' : 'low'}>
                  {u.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Member / Engineer'}
                </Badge>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  width: '100%',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 14,
                  marginTop: 6,
                }}
              >
                <div>
                  <strong style={{ fontSize: 16, color: '#0f172a', display: 'block' }}>{userTasks.length}</strong>
                  <span style={{ fontSize: 11, color: 'var(--text-light)' }}>Assigned Tasks</span>
                </div>
                <div>
                  <strong style={{ fontSize: 16, color: '#0f172a', display: 'block' }}>{userProjects.length}</strong>
                  <span style={{ fontSize: 11, color: 'var(--text-light)' }}>Projects</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function TeamsPage() {
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [uRes, pRes] = await Promise.all([
          api.get('/api/users').catch(() => ({ data: { users: [] } })),
          api.get('/api/projects'),
        ])
        setUsers(uRes.data.users || [])
        setProjects(pRes.data.projects || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingState message="Loading squad divisions..." />

  const squads = [
    {
      id: 'core-fe',
      name: 'Frontend Engineering Squad',
      desc: 'Responsible for responsive web applications, design token libraries, and component UX.',
      lead: users[0] || { name: 'Alex Morgan' },
      members: users.slice(3, 7),
      activeProject: projects[0]?.name || 'Atlas Mobile App v2',
    },
    {
      id: 'platform-devops',
      name: 'Cloud Platform & Reliability',
      desc: 'Kubernetes orchestration, automated CI/CD pipelines, and zero-downtime databases.',
      lead: users[1] || { name: 'Sarah Chen' },
      members: users.slice(7, 11),
      activeProject: projects[1]?.name || 'Cloud Infrastructure Migration',
    },
    {
      id: 'fintech-core',
      name: 'Financial Ledger & Security',
      desc: 'PCI-DSS certified payment streams, automated reconciliation, and audit pipelines.',
      lead: users[2] || { name: 'David Wilson' },
      members: users.slice(11, 15),
      activeProject: projects[2]?.name || 'FinTech Customer Portal',
    },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Squad Architecture"
        title="Teams & Squads"
        description="Functional engineering groups, squad leads, and cross-project allocations."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {squads.map((squad) => (
          <Card key={squad.id} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <h3 className="card-title" style={{ fontSize: 16 }}>{squad.name}</h3>
              <p className="card-subtitle" style={{ marginTop: 4 }}>{squad.desc}</p>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--bg-app)', borderRadius: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Squad Lead</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <Avatar name={squad.lead.name} avatar={squad.lead.avatar} size="xs" />
                <strong style={{ fontSize: 13, color: '#0f172a' }}>{squad.lead.name}</strong>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                <span>Squad Members ({squad.members.length})</span>
                <span>Active: <strong>{squad.activeProject}</strong></span>
              </div>
              <AvatarGroup users={squad.members} max={5} size="sm" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function WorkloadPage() {
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [uRes, tRes] = await Promise.all([
          api.get('/api/users').catch(() => ({ data: { users: [] } })),
          api.get('/api/tasks'),
        ])
        setUsers(uRes.data.users || [])
        setTasks(tRes.data.tasks || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingState message="Calculating workload balance..." />

  return (
    <div>
      <PageHeader
        eyebrow="Resource Management"
        title="Workload Balance"
        description="Prevent developer burnout by tracking task commitments against sprint capacity."
      />

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {users.map((u) => {
            const userTasks = tasks.filter((t) => t.assignedTo?._id === u._id)
            const inProgress = userTasks.filter((t) => t.status === 'IN_PROGRESS').length
            const completed = userTasks.filter((t) => t.status === 'COMPLETED').length
            const todo = userTasks.filter((t) => t.status === 'TODO').length

            // Workload score (max 5 active tasks per sprint)
            const activeLoad = inProgress + todo
            const loadPct = Math.min(100, Math.round((activeLoad / 5) * 100))
            const statusColor = loadPct > 80 ? 'var(--danger)' : loadPct > 50 ? 'var(--warning)' : 'var(--success)'

            return (
              <div
                key={u._id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 8,
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={u.name} avatar={u.avatar} size="sm" />
                    <div>
                      <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>{u.name}</strong>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>
                      {activeLoad} active tasks ({loadPct}% capacity)
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>
                      {completed} finished this sprint
                    </div>
                  </div>
                </div>

                <ProgressBar value={loadPct} color={statusColor} />
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
