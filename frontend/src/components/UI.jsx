import { forwardRef } from 'react'
import { FolderKanban, AlertCircle, X } from 'lucide-react'

export function Button({ children, variant = 'primary', size = 'md', icon: Icon, className = '', ...props }) {
  const sizeClass = size === 'sm' ? 'btn-sm' : ''
  const variantClass = `btn-${variant}`
  return (
    <button className={`btn ${variantClass} ${sizeClass} ${className}`} {...props}>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  const toneClass = `badge-${tone.toLowerCase().replace('-', '_')}`
  return (
    <span className={`badge ${toneClass} ${className}`}>
      {children}
    </span>
  )
}

export const Card = forwardRef(function Card({ children, className = '', ...props }, ref) {
  return (
    <div ref={ref} className={`card ${className}`} {...props}>
      {children}
    </div>
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

  const sizeClass = `avatar-${size}`

  return (
    <span className={`avatar ${sizeClass} ${className}`} title={name}>
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
        <span className={`avatar avatar-${size}`} style={{ background: '#f1f5f9', color: '#64748b' }}>
          +{remaining}
        </span>
      )}
    </div>
  )
}

export function PageHeader({ eyebrow, title, description, actions, action }) {
  return (
    <div className="page-header">
      <div className="page-header-text">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {(actions || action) && (
        <div className="page-header-actions">
          {actions || action}
        </div>
      )}
    </div>
  )
}

export function StatCard({ label, value, subtext, icon: Icon, iconColor = '#4f46e5', iconBg = '#eef2ff', trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        {Icon && (
          <div className="stat-icon-wrapper" style={{ background: iconBg, color: iconColor }}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="stat-card-val">{value}</div>
      {subtext && (
        <div className={`stat-card-sub ${trend === 'up' ? 'positive' : ''}`}>
          {subtext}
        </div>
      )}
    </div>
  )
}

export function ProgressBar({ value = 0, color = 'var(--primary)' }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className="progress-container">
      <div className="progress-fill" style={{ width: `${clamped}%`, backgroundColor: color }} />
    </div>
  )
}

export function EmptyState({ title = 'No items found', description = 'There are no records to display.', action, icon: Icon = FolderKanban }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={24} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}

export function LoadingState({ message = 'Loading data...' }) {
  return (
    <div className="page-loading">
      <div className="loading-spinner" />
      <span>{message}</span>
    </div>
  )
}

export function ErrorState({ message = 'An unexpected error occurred.', onRetry }) {
  return (
    <div className="empty-state" style={{ color: 'var(--danger-text)' }}>
      <div className="empty-state-icon" style={{ background: 'var(--danger-subtle)', color: 'var(--danger-text)' }}>
        <AlertCircle size={24} />
      </div>
      <h3>Something went wrong</h3>
      <p style={{ color: 'var(--text-muted)' }}>{message}</p>
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="card-title">{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
