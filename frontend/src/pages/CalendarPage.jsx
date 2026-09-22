import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  FolderKanban,
  CheckSquare,
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

export default function CalendarPage() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    async function load() {
      try {
        const [tRes, pRes] = await Promise.all([
          api.get('/api/tasks'),
          api.get('/api/projects'),
        ])
        setTasks(tRes.data.tasks || [])
        setProjects(pRes.data.projects || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingState message="Generating schedule calendar..." />

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // First day of month and total days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Find deliverables due in this month
  const deliverables = [
    ...tasks.map((t) => ({
      id: `task-${t._id}`,
      title: t.title,
      link: `/tasks/${t._id}`,
      date: new Date(t.dueDate),
      type: 'task',
      priority: t.priority,
      status: t.status,
      project: t.project?.name,
    })),
    ...projects.map((p) => ({
      id: `proj-${p._id}`,
      title: `${p.name} (Deadline)`,
      link: `/projects/${p._id}`,
      date: new Date(p.deadline),
      type: 'project',
      priority: 'HIGH',
      status: p.status,
      project: p.name,
    })),
  ].filter((d) => d.date.getFullYear() === year && d.date.getMonth() === month)

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Chronological Schedule"
        title="Calendar & Deadlines"
        description="Visual map of target delivery dates, sprint milestones, and project deadlines."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button variant="secondary" size="sm" onClick={prevMonth}>
              <ChevronLeft size={16} />
            </Button>
            <span style={{ fontWeight: 700, fontSize: 14, minWidth: 130, textAlign: 'center' }}>
              {monthNames[month]} {year}
            </span>
            <Button variant="secondary" size="sm" onClick={nextMonth}>
              <ChevronRight size={16} />
            </Button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Monthly Grid */}
        <Card style={{ padding: 16 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: 10,
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-light)',
            }}
          >
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 4,
              marginTop: 8,
            }}
          >
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} style={{ minHeight: 74, background: '#fafbfc', borderRadius: 6 }} />
              }

              const dayDeliverables = deliverables.filter((d) => d.date.getDate() === day)

              return (
                <div
                  key={`day-${day}`}
                  style={{
                    minHeight: 74,
                    padding: 6,
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    background: dayDeliverables.length > 0 ? '#ffffff' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>{day}</span>
                  {dayDeliverables.slice(0, 2).map((d) => (
                    <Link
                      key={d.id}
                      to={d.link}
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 4px',
                        borderRadius: 4,
                        background: d.type === 'project' ? '#fef3c7' : '#e0e7ff',
                        color: d.type === 'project' ? '#b45309' : '#3730a3',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                      title={d.title}
                    >
                      {d.title}
                    </Link>
                  ))}
                  {dayDeliverables.length > 2 && (
                    <span style={{ fontSize: 9, color: 'var(--text-light)', fontWeight: 600 }}>
                      +{dayDeliverables.length - 2} more
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Deliverables in Month Agenda */}
        <Card>
          <h3 className="card-title" style={{ marginBottom: 14 }}>
            Deliverables in {monthNames[month]}
          </h3>

          {deliverables.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No items scheduled for this month.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {deliverables.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge tone={item.type === 'project' ? 'active' : item.priority}>
                      {item.type === 'project' ? 'Project Deadline' : item.priority}
                    </Badge>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {monthNames[month].slice(0, 3)} {item.date.getDate()}
                    </span>
                  </div>

                  <Link
                    to={item.link}
                    style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'block', marginTop: 6 }}
                  >
                    {item.title}
                  </Link>

                  <span style={{ fontSize: 11, color: 'var(--text-light)', display: 'block', marginTop: 2 }}>
                    {item.project}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
