import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="main-wrapper">
        <Topbar onToggleMobile={() => setMobileOpen(!mobileOpen)} />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
