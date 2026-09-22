import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Sparkles } from 'lucide-react'
import { Avatar } from './UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Topbar({ onToggleMobile }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchVal, setSearchVal] = useState('')

  const pathParts = location.pathname.split('/').filter(Boolean)
  const currentSection = pathParts[0] ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1) : 'Dashboard'

  function handleSearchSubmit(e) {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`)
    }
  }

  // Keyboard shortcut ⌘K / Ctrl+K to focus search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const input = document.getElementById('global-search-input')
        if (input) input.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-nav-toggle" onClick={onToggleMobile} title="Open menu">
          <Menu size={20} />
        </button>
        <div className="topbar-breadcrumbs">
          <span>Workspace</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">{currentSection}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <Search size={14} color="var(--text-light)" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search everything..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
          <span className="search-kbd">⌘K</span>
        </div>

        <Link to="/notifications" className="icon-action-btn" title="Notifications">
          <Bell size={16} />
          <span className="notification-dot" />
        </Link>

        <Link to="/profile" style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar name={user?.name || 'User'} avatar={user?.avatar} size="sm" />
        </Link>
      </div>
    </header>
  )
}
