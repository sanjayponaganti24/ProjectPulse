import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle,
  FolderKanban,
  CheckSquare,
  Trello,
  Shield,
  Zap,
  BarChart3,
  Users,
} from 'lucide-react'
import { Button, Badge } from '../components/UI.jsx'

export default function LandingPage() {
  const features = [
    {
      title: 'Portfolio & Project Management',
      desc: 'Organize initiatives, track deadlines, assign members, and monitor milestone completions in real time.',
      icon: FolderKanban,
    },
    {
      title: 'Smart Task Delegation',
      desc: 'Assign prioritized tasks, track delivery estimates, and keep cross-functional teams in sync.',
      icon: CheckSquare,
    },
    {
      title: 'Interactive Kanban Boards',
      desc: 'Fluid drag-and-drop workflow columns with optimistic UI updates and instant synchronization.',
      icon: Trello,
    },
    {
      title: 'Issue & Bug Triage',
      desc: 'Resolve blockers fast with severity tagging, direct task association, and clear ownership.',
      icon: Shield,
    },
    {
      title: 'Sprint Cycles & Milestones',
      desc: 'Plan two-week delivery increments and track progress towards major product releases.',
      icon: Zap,
    },
    {
      title: 'Team Workload & Insights',
      desc: 'Prevent burnout and eliminate bottlenecks with visual workload heatmaps and velocity reports.',
      icon: Users,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      {/* Top Navigation */}
      <header
        style={{
          borderBottom: '1px solid #e2e8f0',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                borderRadius: 8,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              P
            </div>
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 18 }}>
              Project<span style={{ color: '#4f46e5' }}>Pulse</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/login">
              <Button variant="secondary" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '72px 24px 48px', textAlign: 'center' }}>
        <Badge tone="low" style={{ marginBottom: 16, padding: '4px 12px' }}>
          Next-Gen Agile Project Suite
        </Badge>
        <h1
          style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 'clamp(36px, 6vw, 58px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.04em',
            color: '#0f172a',
            marginBottom: 20,
          }}
        >
          Manage Projects, Sprints & Teams{' '}
          <span style={{ color: '#4f46e5' }}>with Total Clarity</span>
        </h1>
        <p
          style={{
            fontSize: 'clamp(16px, 2.5vw, 19px)',
            color: '#64748b',
            lineHeight: 1.6,
            maxWidth: 680,
            margin: '0 auto 32px',
          }}
        >
          ProjectPulse eliminates project friction. Centralize tasks, track milestone velocity, unblock issues, and align every contributor in one clean workspace.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link to="/login">
            <Button size="md" icon={ArrowRight}>
              Sign in to Workspace
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="secondary" size="md">
              Create Free Account
            </Button>
          </Link>
        </div>

        <div
          style={{
            marginTop: 50,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.1)',
            overflow: 'hidden',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              padding: '12px 18px',
              borderBottom: '1px solid #edf1f7',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }} />
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 12 }}>
              app.projectpulse.dev / dashboard
            </span>
          </div>

          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Projects</span>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '6px 0' }}>--</div>
              <Badge tone="active">Live data</Badge>
            </div>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Tasks</span>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '6px 0' }}>--</div>
              <Badge tone="medium">Assigned</Badge>
            </div>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Issues</span>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '6px 0' }}>--</div>
              <Badge tone="critical">Tracked</Badge>
            </div>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Progress</span>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '6px 0' }}>--</div>
              <Badge tone="completed">Reported</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
            Built for High-Performing Teams
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
            Everything you need from initial product specification to post-release maintenance.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: '#eef2ff',
                    color: '#4f46e5',
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                  {feat.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', padding: '32px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
        <p>© 2026 ProjectPulse Agile Suite. Designed with clean SaaS aesthetics.</p>
      </footer>
    </div>
  )
}
