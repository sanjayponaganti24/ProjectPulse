import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { LoadingState } from './UI.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: 'var(--bg-app)' }}>
        <LoadingState message="Authenticating session..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
