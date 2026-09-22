import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Trello,
  AlertCircle,
  Flag,
  Zap,
  Calendar,
  Users,
  Layers,
  BarChart2,
  PieChart,
  MessageSquare,
  FileText,
  Shield,
  Settings,
  History,
  LogOut,
  X,
  UserCheck,
} from 'lucide-react'
import { Avatar } from './UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch (e) {
      console.error(e)
    }
  }

  const navSections = [
    {
      title: 'Work Management',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/projects', label: 'Projects', icon: FolderKanban },
        { to: '/tasks', label: 'Tasks', icon: CheckSquare },
        { to: '/kanban', label: 'Kanban Board', icon: Trello },
        { to: '/issues', label: 'Issues & Bugs', icon: AlertCircle },
      ],
    },
    {
      title: 'Planning & Delivery',
      items: [
        { to: '/milestones', label: 'Milestones', icon: Flag },
        { to: '/sprints', label: 'Sprints', icon: Zap },
        { to: '/calendar', label: 'Calendar', icon: Calendar },
      ],
    },
    {
      title: 'Collaboration',
      items: [
        { to: '/team', label: 'Team Members', icon: Users },
        { to: '/teams', label: 'Teams / Squads', icon: Layers },
        { to: '/workload', label: 'Workload', icon: BarChart2 },
        { to: '/activity', label: 'Comments & Activity', icon: MessageSquare },
        { to: '/files', label: 'Files & Assets', icon: FileText },
      ],
    },
    {
      title: 'Insights & Logs',
      items: [
        { to: '/reports', label: 'Reports & Analytics', icon: PieChart },
        { to: '/history', label: 'Audit History', icon: History },
      ],
    },
    {
      title: 'Administration',
      items: [
        { to: '/admin/users', label: 'Organisation Users', icon: UserCheck },
        { to: '/admin/roles', label: 'Roles & Permissions', icon: Shield },
        { to: '/admin/settings', label: 'Org Settings', icon: Settings },
      ],
    },
  ]

  const roleLabel = user?.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Member'

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            zIndex: 35,
          }}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <div className="brand-icon">P</div>
            <span>
              Project<span className="brand-accent">Pulse</span>
            </span>
          </div>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="sidebar-workspace">
          <div className="workspace-badge">PP</div>
          <div className="workspace-info">
            <strong>Acme Global Corp</strong>
            <small>Enterprise Workspace</small>
          </div>
        </div>

        <div className="sidebar-nav-container">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="nav-section-title">{section.title}</div>
              <ul className="nav-link-list">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onCloseMobile}
                        className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <NavLink to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <Avatar name={user?.name || 'User'} avatar={user?.avatar} size="sm" />
            <div className="sidebar-user-meta">
              <strong>{user?.name || 'Workspace User'}</strong>
              <span>{roleLabel}</span>
            </div>
          </NavLink>
          <button onClick={handleLogout} className="sidebar-logout-btn" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  )
}
