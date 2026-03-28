import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
          {t('sidebar.general')}
        </p>
        <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive)}>
          {t('sidebar.dashboard')}
        </NavLink>
        <NavLink to="/profile" style={({ isActive }) => linkStyle(isActive)}>
          {t('sidebar.profile')}
        </NavLink>
      </div>

      {(isAdmin || isOwner) && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, padding: '0 0.75rem', marginBottom: '0.5rem' }}>
            {t('sidebar.management')}
          </p>
          <NavLink to="/users" style={({ isActive }) => linkStyle(isActive)}>
            {t('sidebar.users')}
          </NavLink>
          <NavLink to="/roles" style={({ isActive }) => linkStyle(isActive)}>
            {t('sidebar.roles')}
          </NavLink>
        </div>
      )}

      {isOwner && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, padding: '0 0.75rem', marginBottom: '0.5rem' }}>
            {t('sidebar.system')}
          </p>
          <NavLink to="/register" style={({ isActive }) => linkStyle(isActive)}>
            {t('sidebar.registerUser')}
          </NavLink>
          <NavLink to="/backup" style={({ isActive }) => linkStyle(isActive)}>
            {t('sidebar.backup')}
          </NavLink>
          <NavLink to="/api-docs" style={({ isActive }) => linkStyle(isActive)}>
            {t('sidebar.apiDocs')}
          </NavLink>
        </div>
      )}
    </aside>
  )
}
