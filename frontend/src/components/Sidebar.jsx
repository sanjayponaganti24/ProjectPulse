import { NavLink, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { Avatar } from "./UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export const ROLE_LABELS = {
  ORGANISATION_ADMIN: "Organisation Admin",
  PROJECT_MANAGER: "Project Manager",
  TEAM_LEAD: "Team Lead",
  MEMBER: "Developer / Member",
  STAKEHOLDER: "Stakeholder",
};

export function getNavItemsForRole(role) {
  switch (role) {
    case "ORGANISATION_ADMIN":
      return [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/projects", label: "Projects", icon: FolderKanban },
        { to: "/team", label: "Team & Roles", icon: Users },
        { to: "/reports", label: "Reports", icon: Activity },
      ];
    case "PROJECT_MANAGER":
      return [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/projects", label: "Projects", icon: FolderKanban },
        { to: "/tasks", label: "Tasks", icon: ClipboardList },
        { to: "/kanban", label: "Kanban", icon: Target },
        { to: "/team", label: "Team", icon: Users },
        { to: "/issues", label: "Issues", icon: CircleAlert },
        { to: "/reports", label: "Reports", icon: Activity },
      ];
    case "TEAM_LEAD":
      return [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/projects", label: "Projects", icon: FolderKanban },
        { to: "/tasks", label: "Tasks", icon: ClipboardList },
        { to: "/kanban", label: "Kanban", icon: Target },
        { to: "/team", label: "Team", icon: Users },
        { to: "/issues", label: "Issues", icon: CircleAlert },
        { to: "/reports", label: "Reports", icon: Activity },
      ];
    case "MEMBER":
      return [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/tasks", label: "My Tasks", icon: ClipboardList },
        { to: "/projects", label: "Projects", icon: FolderKanban },
        { to: "/kanban", label: "Kanban", icon: Target },
        { to: "/issues", label: "Issues", icon: CircleAlert },
      ];
    case "STAKEHOLDER":
      return [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/projects", label: "Projects", icon: FolderKanban },
        { to: "/milestones", label: "Milestones", icon: Target },
        { to: "/reports", label: "Reports", icon: Activity },
      ];
    default:
      return [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/projects", label: "Projects", icon: FolderKanban },
        { to: "/tasks", label: "Tasks", icon: ClipboardList },
      ];
  }
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  }

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || "Member";
  const navItems = getNavItemsForRole(user?.role);
  const workspaceName = user?.organisation?.name || "ProjectPulse Workspace";

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
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand-row">
          <div className="brand">
            <span className="brand-mark">P</span>
            <span>
              Project<span className="brand-accent">Pulse</span>
            </span>
          </div>
          <button
            type="button"
            className="mobile-close"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <p className="sidebar-tagline">Plan. Assign. Track. Complete.</p>

        <div className="workspace-switcher">
          <div className="workspace-mark">P</div>
          <div>
            <strong>{workspaceName}</strong>
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
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-secondary">
          <NavLink
            to="/search"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Search size={18} />
            <span>Search</span>
          </NavLink>
          <NavLink
            to="/profile"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Settings size={18} />
            <span>Profile</span>
          </NavLink>
        </div>

        <div className="sidebar-user">
          <Avatar name={user?.name || "User"} size="md" />
          <div>
            <strong>{user?.name || "Workspace user"}</strong>
            <small>{roleLabel}</small>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
