import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header style={{
      height: '60px',
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 1.5rem',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    }}>
      <Link to="/dashboard" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>
        Soppadop
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {user?.username} <span style={{ color: '#3b82f6' }}>({user?.role?.name})</span>
        </span>
        <Link to="/profile" style={{ fontSize: '0.875rem', color: '#3b82f6' }}>Profile</Link>
        <button onClick={logout} style={{
          padding: '0.375rem 0.75rem', background: '#ef4444', color: '#fff',
          borderRadius: '4px', fontSize: '0.8rem',
        }}>
          Logout
        </button>
      </nav>
    </header>
  )
}
