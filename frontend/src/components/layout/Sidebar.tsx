import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Shield } from '@/components/ui/Icons'

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
        <NavLink to="/admin/dashboard" style={({ isActive }) => linkStyle(isActive)}>
          {t('sidebar.dashboard')}
        </NavLink>
        <NavLink to="/admin/profile" style={({ isActive }) => linkStyle(isActive)}>
          {t('sidebar.profile')}
        </NavLink>
      </div>

      {(isAdmin || isOwner) && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, padding: '0 0.75rem', marginBottom: '0.5rem' }}>
            {t('sidebar.management')}
          </p>
          <NavLink to="/admin/users" style={({ isActive }) => linkStyle(isActive)}>
            {t('sidebar.users')}
          </NavLink>
          <NavLink to="/admin/roles" style={({ isActive }) => linkStyle(isActive)}>
            {t('sidebar.roles')}
          </NavLink>
          <NavLink to="/admin/resources" style={({ isActive }) => linkStyle(isActive)}>
            {t('sidebar.resources')}
          </NavLink>
          <NavLink to="/admin/page-admin" style={({ isActive }) => linkStyle(isActive)}>
            {t('sidebar.pageAdmin')}
          </NavLink>
          <NavLink to="/admin/abac" style={({ isActive }) => ({
            ...linkStyle(isActive),
            color: isActive ? '#7c3aed' : '#7c3aed',
            background: isActive ? '#f5f3ff' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: isActive ? 700 : 500,
          })}
          >
            <Shield size={14} />
            ABAC Policy
          </NavLink>
        </div>
      )}

      {isOwner && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, padding: '0 0.75rem', marginBottom: '0.5rem' }}>
            {t('sidebar.system')}
          </p>
          <NavLink to="/admin/register" style={({ isActive }) => linkStyle(isActive)}>
            {t('sidebar.registerUser')}
          </NavLink>
          <NavLink to="/admin/backup" style={({ isActive }) => linkStyle(isActive)}>
            {t('sidebar.backup')}
          </NavLink>
          <NavLink to="/admin/api-docs" style={({ isActive }) => linkStyle(isActive)}>
            {t('sidebar.apiDocs')}
          </NavLink>
        </div>
      )}
    </aside>
  )
}
