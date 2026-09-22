import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  FileText,
  Bell,
  CheckCircle2,
  Clock,
  Download,
  FileCode,
  FileSpreadsheet,
  Image,
  Folder,
  Check,
  Filter,
} from 'lucide-react'
import {
  PageHeader,
  Card,
  Badge,
  Avatar,
  Button,
  LoadingState,
  ErrorState,
} from '../components/UI.jsx'
import api from '../services/api.js'

export function ActivityPage() {
  const [tasks, setTasks] = useState([])
  const [issues, setIssues] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActivity() {
      try {
        const [tRes, iRes, pRes] = await Promise.all([
          api.get('/api/tasks'),
          api.get('/api/issues'),
          api.get('/api/projects'),
        ])
        setTasks(tRes.data.tasks || [])
        setIssues(iRes.data.issues || [])
        setProjects(pRes.data.projects || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadActivity()
  }, [])

  if (loading) return <LoadingState message="Aggregating activity stream..." />

  // Generate realistic activity events derived from real DB data
  const events = [
    ...tasks.map((t) => ({
      id: `task-${t._id}`,
      user: t.assignedTo || t.createdBy,
      action: t.status === 'COMPLETED' ? 'completed task' : 'updated task',
      target: t.title,
      link: `/tasks/${t._id}`,
      project: t.project?.name,
      time: new Date(t.updatedAt || t.createdAt),
      type: 'task',
    })),
    ...issues.map((i) => ({
      id: `issue-${i._id}`,
      user: i.reportedBy,
      action: 'reported issue',
      target: i.title,
      link: `/issues/${i._id}`,
      project: i.project?.name,
      time: new Date(i.createdAt),
      type: 'issue',
    })),
    ...projects.map((p) => ({
      id: `project-${p._id}`,
      user: p.manager,
      action: 'initialized initiative',
      target: p.name,
      link: `/projects/${p._id}`,
      project: p.name,
      time: new Date(p.createdAt),
      type: 'project',
    })),
  ].sort((a, b) => b.time - a.time)

  return (
    <div>
      <PageHeader
        eyebrow="Chronicle"
        title="Comments & Activity"
        description="Unified audit feed of updates, status transitions, and contributor collaboration."
      />

      <Card style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {events.map((evt) => (
            <div
              key={evt.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 8,
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Avatar name={evt.user?.name || 'User'} avatar={evt.user?.avatar} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--text-main)' }}>
                  <strong>{evt.user?.name || 'Contributor'}</strong>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>{evt.action}</span>{' '}
                  <Link to={evt.link} style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    "{evt.target}"
                  </Link>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4, display: 'flex', gap: 10 }}>
                  {evt.project && <span>in <strong>{evt.project}</strong></span>}
                  <span>•</span>
                  <span>{evt.time.toLocaleDateString()} at {evt.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <Badge tone={evt.type === 'issue' ? 'critical' : evt.type === 'task' ? 'active' : 'low'}>
                {evt.type}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function FilesPage() {
  // Document registry structured for SaaS files view without fake upload persistence
  const initialFiles = [
    {
      id: 'f1',
      name: 'System_Architecture_v2.pdf',
      project: 'Atlas Mobile App v2',
      size: '4.2 MB',
      updated: 'Sep 18, 2026',
      author: 'Alex Morgan',
      icon: FileText,
      tag: 'PDF Specification',
    },
    {
      id: 'f2',
      name: 'EKS_Cluster_Terraform_Config.tf',
      project: 'Cloud Infrastructure Migration',
      size: '184 KB',
      updated: 'Sep 14, 2026',
      author: 'Sarah Chen',
      icon: FileCode,
      tag: 'IaC Manifest',
    },
    {
      id: 'f3',
      name: 'PCI_DSS_Audit_Checklist.xlsx',
      project: 'FinTech Customer Portal',
      size: '1.1 MB',
      updated: 'Sep 10, 2026',
      author: 'David Wilson',
      icon: FileSpreadsheet,
      tag: 'Compliance Doc',
    },
    {
      id: 'f4',
      name: 'Design_Tokens_LUNO_Palette.json',
      project: 'Design System & Component Library',
      size: '42 KB',
      updated: 'Sep 21, 2026',
      author: 'Priya Sharma',
      icon: FileCode,
      tag: 'Design Tokens',
    },
    {
      id: 'f5',
      name: 'Onboarding_User_Flow_Diagram.png',
      project: 'Atlas Mobile App v2',
      size: '2.8 MB',
      updated: 'Sep 19, 2026',
      author: 'Emily Davis',
      icon: Image,
      tag: 'Asset Diagram',
    },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Storage & Documents"
        title="Files & Deliverables"
        description="Specifications, architectural diagrams, compliance matrices, and assets."
      />

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Project Scope</th>
              <th>Category</th>
              <th>File Size</th>
              <th>Last Modified</th>
              <th>Uploaded By</th>
              <th style={{ textAlign: 'right' }}>Download</th>
            </tr>
          </thead>
          <tbody>
            {initialFiles.map((f) => {
              const Icon = f.icon
              return (
                <tr key={f.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          background: '#eef2ff',
                          color: '#4f46e5',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{f.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-muted)' }}>{f.project}</span>
                  </td>
                  <td>
                    <Badge tone="low">{f.tag}</Badge>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.size}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.updated}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{f.author}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => alert(`Download started for ${f.name}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        padding: 6,
                      }}
                      title="Download file"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('ALL')
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Task Assigned',
      desc: 'Sarah Chen assigned you to "Provision EKS cluster with Terraform"',
      time: '15 minutes ago',
      read: false,
      category: 'TASKS',
      link: '/tasks',
    },
    {
      id: 'n2',
      title: 'High Severity Issue',
      desc: 'David Wilson reported "Token expiry causes white screen on app resume"',
      time: '1 hour ago',
      read: false,
      category: 'ISSUES',
      link: '/issues',
    },
    {
      id: 'n3',
      title: 'Sprint 14 Target',
      desc: 'Sprint 14 reached 68% milestone velocity benchmark.',
      time: '3 hours ago',
      read: true,
      category: 'SYSTEM',
      link: '/sprints',
    },
    {
      id: 'n4',
      title: 'Project Member Added',
      desc: 'You were added as a contributor to "Atlas Mobile App v2".',
      time: '1 day ago',
      read: true,
      category: 'MENTIONS',
      link: '/projects',
    },
  ])

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function toggleRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  const filtered = notifications.filter((n) =>
    activeTab === 'ALL' ? true : n.category === activeTab
  )

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Alerts, task assignments, blocker notifications, and mentions."
        actions={
          <Button variant="secondary" size="sm" icon={Check} onClick={markAllRead}>
            Mark all read
          </Button>
        }
      />

      {/* Tabs */}
      <div className="tabs-nav">
        {['ALL', 'TASKS', 'ISSUES', 'MENTIONS', 'SYSTEM'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Card style={{ padding: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>
              No notifications in this filter category.
            </p>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: n.read ? '#ffffff' : 'var(--primary-subtle)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
                onClick={() => toggleRead(n.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: n.read ? 'transparent' : 'var(--primary)',
                    }}
                  />
                  <div>
                    <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>{n.title}</strong>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{n.desc}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{n.time}</span>
                  <Badge tone="low">{n.category}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
