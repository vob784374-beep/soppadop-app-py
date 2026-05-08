import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Modal } from '@/components/ui'

export default function Header() {
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'vi' : 'en'
    i18n.changeLanguage(next)
  }

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
      <Link to="/admin/dashboard" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>
        Soppadop
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={toggleLang} title="Switch language" style={{
          padding: '0.25rem 0.5rem',
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '0.8rem',
          cursor: 'pointer',
          fontWeight: 600,
        }}>
          {i18n.language === 'en' ? 'VI' : 'EN'}
        </button>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {user?.username} <span style={{ color: '#3b82f6' }}>({user?.role?.name})</span>
        </span>
        <Link to="/admin/profile" style={{ fontSize: '0.875rem', color: '#3b82f6' }}>{t('header.profile')}</Link>
        <button onClick={() => setShowLogoutConfirm(true)} style={{
          padding: '0.375rem 0.75rem', background: '#ef4444', color: '#fff',
          borderRadius: '4px', fontSize: '0.8rem',
        }}>
          {t('header.logout')}
        </button>
      </nav>

      <Modal open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title={t('header.logoutTitle')}>
        <p style={{ margin: '0 0 1.25rem', color: '#6b7280', fontSize: '0.875rem' }}>
          {t('header.logoutMessage')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button onClick={() => setShowLogoutConfirm(false)} style={{
            padding: '0.5rem 1rem', background: '#f3f4f6', color: '#374151',
            border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.8rem',
            cursor: 'pointer',
          }}>
            {t('common.cancel')}
          </button>
          <button onClick={() => { setShowLogoutConfirm(false); logout() }} style={{
            padding: '0.5rem 1rem', background: '#ef4444', color: '#fff',
            border: 'none', borderRadius: '6px', fontSize: '0.8rem',
            cursor: 'pointer', fontWeight: 600,
          }}>
            {t('header.logout')}
          </button>
        </div>
      </Modal>
    </header>
  )
}
