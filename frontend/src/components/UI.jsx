import { forwardRef } from 'react'
import { FolderKanban, AlertCircle, X } from 'lucide-react'

export function Button({ children, variant = 'primary', size = 'md', icon: Icon, className = '', ...props }) {
  const sizeClass = size === 'sm' ? 'button-sm' : ''
  return (
    <button className={`button button-${variant} ${sizeClass} ${className}`.trim()} {...props}>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  const toneClass = `badge-${tone.toLowerCase().replace(/_/g, '-')}`
  return <span className={`badge ${toneClass} ${className}`.trim()}>{children}</span>
}

export const Card = forwardRef(function Card({ children, className = '', ...props }, ref) {
  return (
    <section ref={ref} className={`card ${className}`.trim()} {...props}>
      {children}
    </section>
  )
})

export function Avatar({ name = 'User', avatar = '', size = 'md', className = '' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span className={`avatar avatar-${size} ${className}`.trim()} title={name}>
      {avatar ? <img src={avatar} alt={name} /> : initials}
    </span>
  )
}

export function AvatarGroup({ users = [], max = 4, size = 'sm' }) {
  const visible = users.slice(0, max)
  const remaining = users.length - max

  return (
    <div className="avatar-group">
      {visible.map((u, i) => (
        <Avatar key={u._id || u.id || i} name={u.name} avatar={u.avatar} size={size} />
      ))}
      {remaining > 0 && (
        <span className={`avatar avatar-${size} avatar-overflow`}>+{remaining}</span>
      )}
    </div>
  )
}

export function PageHeader({ eyebrow, title, description, actions, action }) {
  const headerAction = actions || action
  return (
    <div className="page-header">
      <div className="page-header-text">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {headerAction && <div className="page-header-actions">{headerAction}</div>}
    </div>
  )
}

export function StatCard({ label, value, subtext, icon: Icon, iconColor = 'var(--primary)', iconBg = 'var(--primary-soft)', trend }) {
  return (
    <Card className="stat-card">
      <div className="stat-card-top">
        <span>{label}</span>
        {Icon && (
          <div className="stat-icon" style={{ color: iconColor, background: iconBg }}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <strong>{value}</strong>
      {subtext && <small className={trend === 'up' ? 'stat-trend-up' : ''}>{subtext}</small>}
    </Card>
  )
}

export function ProgressBar({ value = 0, color }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className="progress-track">
      <span style={{ width: `${clamped}%`, ...(color ? { background: color } : {}) }} />
    </div>
  )
}

export function EmptyState({ title = 'No items found', description = 'There are no records to display.', action, icon: Icon = FolderKanban }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-screen loading-screen-inline">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  )
}

export function ErrorState({ message = 'An unexpected error occurred.', onRetry }) {
  return (
    <div className="empty-state error-state">
      <div className="empty-icon empty-icon-danger">
        <AlertCircle size={22} />
      </div>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
