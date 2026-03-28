import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const linkStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'block',
  padding: '0.625rem 1rem',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontWeight: isActive ? 600 : 400,
  color: isActive ? '#1d4ed8' : '#374151',
  background: isActive ? '#eff6ff' : 'transparent',
  textDecoration: 'none',
})

export default function Sidebar() {
  const { user } = useAuth()
  const isAdmin = ['admin', 'manager'].includes(user?.role?.name || '')
  const isOwner = user?.is_owner

  return (
    <aside style={{
      width: '220px',
      background: '#fff',
      borderRight: '1px solid #e5e7eb',
      padding: '1rem 0.75rem',
      position: 'fixed',
      top: '60px',
      left: 0,
      bottom: 0,
      overflowY: 'auto',
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, padding: '0 0.75rem', marginBottom: '0.5rem' }}>
          General
        </p>
        <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive)}>
          Dashboard
        </NavLink>
        <NavLink to="/profile" style={({ isActive }) => linkStyle(isActive)}>
          Profile
        </NavLink>
      </div>

      {(isAdmin || isOwner) && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, padding: '0 0.75rem', marginBottom: '0.5rem' }}>
            Management
          </p>
          <NavLink to="/users" style={({ isActive }) => linkStyle(isActive)}>
            Users
          </NavLink>
          <NavLink to="/roles" style={({ isActive }) => linkStyle(isActive)}>
            Roles & Permissions
          </NavLink>
        </div>
      )}

      {isOwner && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, padding: '0 0.75rem', marginBottom: '0.5rem' }}>
            System
          </p>
          <NavLink to="/register" style={({ isActive }) => linkStyle(isActive)}>
            Register User
          </NavLink>
          <NavLink to="/backup" style={({ isActive }) => linkStyle(isActive)}>
            Backup
          </NavLink>
          <NavLink to="/api-docs" style={({ isActive }) => linkStyle(isActive)}>
            API Docs
          </NavLink>
        </div>
      )}
    </aside>
  )
}
