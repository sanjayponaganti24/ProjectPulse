import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Target,
  Users,
  CircleAlert,
  Activity,
  Search,
  Settings,
  LogOut,
  X,
  ChevronDown,
} from 'lucide-react'
import { Avatar } from './UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export const ROLE_LABELS = {
  ORGANISATION_ADMIN: 'Organisation Admin',
  PROJECT_MANAGER: 'Project Manager',
  TEAM_LEAD: 'Team Lead',
  MEMBER: 'Developer / Member',
  STAKEHOLDER: 'Stakeholder',
}

const allNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ORGANISATION_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'MEMBER', 'STAKEHOLDER'] },
  { to: '/projects', label: 'Projects', icon: FolderKanban, roles: ['ORGANISATION_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'MEMBER', 'STAKEHOLDER'] },
  { to: '/tasks', label: 'Tasks', icon: ClipboardList, roles: ['ORGANISATION_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'MEMBER'] },
  { to: '/kanban', label: 'Kanban', icon: Target, roles: ['ORGANISATION_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'MEMBER'] },
  { to: '/team', label: 'Team', icon: Users, roles: ['ORGANISATION_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'] },
  { to: '/issues', label: 'Issues', icon: CircleAlert, roles: ['ORGANISATION_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'MEMBER'] },
  { to: '/reports', label: 'Reports', icon: Activity, roles: ['ORGANISATION_ADMIN', 'PROJECT_MANAGER', 'STAKEHOLDER'] },
]

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

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'Member'
  const navItems = allNavItems.filter((item) => !item.roles || item.roles.includes(user?.role || 'MEMBER'))

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="mobile-overlay"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand-row">
          <div className="brand">
            <span className="brand-mark">P</span>
            <span>
              Project<span className="brand-accent">Pulse</span>
            </span>
          </div>
          <button type="button" className="mobile-close" onClick={onCloseMobile} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <p className="sidebar-tagline">Plan. Assign. Track. Complete.</p>

        <div className="workspace-switcher">
          <div className="workspace-mark">P</div>
          <div>
            <strong>ProjectPulse workspace</strong>
            <small>{roleLabel}</small>
          </div>
          <ChevronDown size={15} aria-hidden />
        </div>

        <nav className="sidebar-nav" aria-label="Main">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-secondary">
          <NavLink to="/search" onClick={onCloseMobile} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Search size={18} />
            <span>Search</span>
          </NavLink>
          <NavLink to="/profile" onClick={onCloseMobile} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Settings size={18} />
            <span>Profile</span>
          </NavLink>
        </div>

        <div className="sidebar-user">
          <Avatar name={user?.name || 'User'} size="md" />
          <div>
            <strong>{user?.name || 'Workspace user'}</strong>
            <small>{roleLabel}</small>
          </div>
          <button type="button" onClick={handleLogout} title="Log out" aria-label="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  )
}
