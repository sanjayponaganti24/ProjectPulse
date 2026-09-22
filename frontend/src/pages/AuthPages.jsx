import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '../components/UI.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail)
    setPassword('Sanju@03')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                borderRadius: 9,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              P
            </div>
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 20 }}>
              Project<span style={{ color: '#4f46e5' }}>Pulse</span>
            </span>
          </Link>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 700, marginTop: 14, color: '#0f172a' }}>
            Sign in to your workspace
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Enter your credentials to access your projects
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 28,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
          }}
        >
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#991b1b',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Password</label>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign in to workspace'}
            </Button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #edf1f7' }}>
            <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Quick Demo Accounts
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => fillDemo('alex.morgan@projectpulse.dev')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                Alex (PM)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('priya.sharma@projectpulse.dev')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                Priya (Member)
              </button>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 20 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'MEMBER',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please complete all required fields.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete registration.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                borderRadius: 9,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              P
            </div>
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 20 }}>
              Project<span style={{ color: '#4f46e5' }}>Pulse</span>
            </span>
          </Link>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 700, marginTop: 14, color: '#0f172a' }}>
            Create your account
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Join your team workspace on ProjectPulse
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 28,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
          }}
        >
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#991b1b',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                name="name"
                type="text"
                className="form-input"
                placeholder="Sarah Chen"
                value={form.name}
                onChange={update}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work email</label>
              <input
                name="email"
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={form.email}
                onChange={update}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={update}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={update}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Workspace role</label>
              <select name="role" className="form-select" value={form.role} onChange={update}>
                <option value="MEMBER">Member (Developer / Contributor)</option>
                <option value="PROJECT_MANAGER">Project Manager (Admin / Lead)</option>
              </select>
            </div>

            <Button type="submit" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
