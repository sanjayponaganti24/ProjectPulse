import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Bell } from "lucide-react";
import { Avatar } from "./UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const sectionLabels = {
  dashboard: "Dashboard",
  projects: "Projects",
  tasks: "Tasks",
  kanban: "Kanban",
  team: "Team",
  issues: "Issues",
  reports: "Reports",
  milestones: "Milestones",
  search: "Search",
  profile: "Profile",
  notifications: "Notifications",
};

export default function Topbar({ onToggleMobile }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const segment =
    location.pathname.split("/").filter(Boolean)[0] || "dashboard";
  const sectionTitle =
    sectionLabels[segment] ||
    segment.charAt(0).toUpperCase() + segment.slice(1);

  function handleGlobalSearch(event) {
    if (event.key === "Enter" && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search-input")?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    let active = true;
    api
      .get("/notifications")
      .then((response) => {
        if (active) setUnreadCount(response.data.unreadCount || 0);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [location.pathname]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu"
          onClick={onToggleMobile}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="topbar-context">
          <span>Workspace</span>
          <strong>{sectionTitle}</strong>
        </div>
      </div>

      <div className="topbar-actions">
        <label className="global-search" htmlFor="global-search-input">
          <Search size={17} />
          <input
            id="global-search-input"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={handleGlobalSearch}
            placeholder="Search anything..."
            autoComplete="off"
          />
          <kbd>Ctrl K</kbd>
        </label>
        <button
          type="button"
          className="icon-button"
          title="Notifications"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          onClick={() => navigate("/notifications")}
        >
          <Bell size={19} />
          {unreadCount > 0 && <i aria-hidden />}
        </button>
        <NavLink to="/profile" className="topbar-avatar" title="Profile">
          <Avatar name={user?.name || "User"} size="sm" />
        </NavLink>
      </div>
    </header>
  );
}
