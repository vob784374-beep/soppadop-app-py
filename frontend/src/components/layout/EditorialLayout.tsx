import { useState, useEffect } from 'react'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { theme as T } from '@/styles/theme'
import { Modal } from '@/components/ui'
import {
  Home, User, Users, Shield, Folder, BookOpen, UserPlus, Download,
  Code, Dashboard, LogOut, Menu, ChevronLeft, Book,
} from '@/components/ui/Icons'

/* ─── Nav Items ────────────────────────────────────────────────── */
type NavItem = {
  path: string
  labelKey: string
  icon: React.ReactNode
  group: string
  roles?: string[]
  ownerOnly?: boolean
}

const ic = (size = 18) => ({ size })

const NAV: NavItem[] = [
  { path: '/admin/dashboard',  labelKey: 'sidebar.dashboard',  group: 'general',     icon: <Home {...ic()} /> },
  { path: '/admin/profile',    labelKey: 'sidebar.profile',    group: 'general',     icon: <User {...ic()} /> },
  { path: '/admin/users',      labelKey: 'sidebar.users',      group: 'management',  roles: ['admin', 'manager'], icon: <Users {...ic()} /> },
  { path: '/admin/roles',      labelKey: 'sidebar.roles',      group: 'management',  roles: ['admin', 'manager'], icon: <Shield {...ic()} /> },
  { path: '/admin/resources',  labelKey: 'sidebar.resources',  group: 'management',  roles: ['admin', 'manager'], icon: <Folder {...ic()} /> },
  { path: '/admin/page-admin', labelKey: 'sidebar.pageAdmin',  group: 'management',  roles: ['admin', 'manager'], icon: <BookOpen {...ic()} /> },
  { path: '/admin/register',   labelKey: 'sidebar.registerUser', group: 'system',    ownerOnly: true, icon: <UserPlus {...ic()} /> },
  { path: '/admin/backup',     labelKey: 'sidebar.backup',     group: 'system',      ownerOnly: true, icon: <Download {...ic()} /> },
  { path: '/admin/api-docs',   labelKey: 'sidebar.apiDocs',    group: 'system',      ownerOnly: true, icon: <Code {...ic()} /> },
]

const GROUP_COLORS: Record<string, { accent: string; soft: string }> = {
  general:    { accent: T.primary,    soft: T.primarySoft },
  management: { accent: T.teal,       soft: T.tealSoft },
  system:     { accent: T.accent,     soft: T.accentSoft },
}

/* ═══ MAIN LAYOUT ═══════════════════════════════════════════════ */
export default function EditorialLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()

  const isAdmin = ['admin', 'manager'].includes(user?.role?.name || '')
  const isOwner = user?.is_owner

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (e.matches) { setCollapsed(true); setMobileOpen(false) }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'vi' : 'en')

  const items = NAV.filter(item => {
    if (item.ownerOnly && !isOwner) return false
    if (item.roles && !item.roles.includes(user?.role?.name || '') && !isOwner) return false
    return true
  })

  const general = items.filter(i => i.group === 'general')
  const mgmt    = items.filter(i => i.group === 'management')
  const sys     = items.filter(i => i.group === 'system')

  const today = new Date()
  const dateLabel = today.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const sidebarW = collapsed ? '64px' : '230px'

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg,
      fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      color: T.ink,
    }}>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 90, backdropFilter: 'blur(4px)',
        }} />
      )}

      {/* ═══ HEADER ═══════════════════════════════════════════ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px) saturate(1.8)',
        borderBottom: `1px solid ${T.border}`,
      }}>
        {/* Ticker */}
        <div style={{
          background: T.dark,
          color: '#fff',
          padding: '0.25rem 1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '0.66rem',
          fontFamily: "'JetBrains Mono', 'Consolas', monospace",
        }}>
          <span style={{ opacity: 0.45 }}>{dateLabel}</span>
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <button onClick={toggleLang} style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px', padding: '0.1rem 0.4rem',
              fontSize: '0.58rem', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {i18n.language === 'en' ? '🇻🇳 VI' : '🇬🇧 EN'}
            </button>
            <span style={{ opacity: 0.15 }}>|</span>
            <span style={{ opacity: 0.7 }}>{user?.username}</span>
            <span style={{
              background: T.primary,
              padding: '0.06rem 0.4rem',
              borderRadius: '4px', fontSize: '0.52rem',
              textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em',
            }}>{user?.role?.name}</span>
          </div>
        </div>

        {/* Main bar */}
        <div style={{
          padding: '0.5rem 1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {isMobile && (
              <button onClick={() => setMobileOpen(!mobileOpen)} style={{
                background: 'none', border: 'none', color: T.ink,
                cursor: 'pointer', padding: '0.2rem',
              }}>
                <Menu size={22} />
              </button>
            )}
            <div style={{
              width: 30, height: 30,
              background: T.gradPrimary,
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: '0.82rem',
              letterSpacing: '-0.03em', boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
            }}>S</div>
            <div>
              <h1 style={{
                fontSize: '1.05rem', fontWeight: 800, color: T.ink,
                letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0,
              }}>Soppadop</h1>
              <span style={{
                fontSize: '0.52rem', color: T.muted,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                fontFamily: "'JetBrains Mono', monospace",
              }}>Admin Panel</span>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
            <NavLink to="/admin/dashboard" style={mastLinkStyle}>
              <Dashboard size={14} />
              {!isMobile && 'Dashboard'}
            </NavLink>
            <span style={{ color: T.borderLt, fontSize: '0.5rem', margin: '0 0.1rem' }}>|</span>
            <NavLink to="/admin/profile" style={mastLinkStyle}>
              <User size={14} />
              {!isMobile && t('header.profile')}
            </NavLink>
            <span style={{ color: T.borderLt, fontSize: '0.5rem', margin: '0 0.1rem' }}>|</span>
            <button onClick={() => setShowLogoutConfirm(true)} style={{
              background: T.rose, color: '#fff', border: 'none',
              padding: '0.28rem 0.7rem', borderRadius: '6px',
              fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.22rem',
              fontFamily: "'Inter', sans-serif",
              transition: 'background 0.15s',
            }}>
              <LogOut size={12} />
              {!isMobile && t('header.logout')}
            </button>
          </nav>
        </div>
      </header>

      {/* ═══ BODY ═════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flex: 1, marginTop: '76px' }}>

        {/* ═══ SIDEBAR ═══════════════════════════════════════ */}
        <aside style={{
          width: isMobile ? '240px' : sidebarW,
          background: T.surface,
          borderRight: `1px solid ${T.border}`,
          position: 'fixed', top: '76px',
          left: isMobile ? (mobileOpen ? 0 : '-240px') : 0,
          bottom: '30px',
          overflowY: 'auto', overflowX: 'hidden',
          transition: isMobile ? 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: isMobile ? 95 : 50,
          display: 'flex', flexDirection: 'column',
          boxShadow: isMobile && mobileOpen ? '4px 0 20px rgba(0,0,0,0.06)' : 'none',
        }}>
          {/* Collapse */}
          {!isMobile && (
            <button onClick={() => setCollapsed(!collapsed)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              padding: '0.5rem 0.7rem 0.3rem',
              background: 'none', color: T.faint, cursor: 'pointer', border: 'none',
            }}>
              <ChevronLeft size={14} />
            </button>
          )}

          {/* Issue badge */}
          {!collapsed && (
            <div style={{
              padding: '0.1rem 0.85rem 0.5rem',
              borderBottom: `1px solid ${T.borderLt}`, marginBottom: '0.3rem',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                fontSize: '0.52rem', textTransform: 'uppercase', letterSpacing: '0.1em',
                color: T.primaryText, fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600, background: T.primarySoft,
                padding: '0.1rem 0.45rem', borderRadius: '4px',
                border: `1px solid ${T.primaryRing}`,
              }}>
                <Book size={9} color={T.primary} />
                Issue #{today.getFullYear()}.{String(today.getMonth() + 1).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Nav */}
          <div style={{ flex: 1, padding: collapsed ? '0.35rem 0.2rem' : '0 0.4rem' }}>
            <NavGroup items={general} collapsed={collapsed} label={t('sidebar.general')} colors={GROUP_COLORS.general} />
            {(isAdmin || isOwner) && (
              <NavGroup items={mgmt} collapsed={collapsed} label={t('sidebar.management')} colors={GROUP_COLORS.management} />
            )}
            {isOwner && (
              <NavGroup items={sys} collapsed={collapsed} label={t('sidebar.system')} colors={GROUP_COLORS.system} />
            )}
          </div>

          {/* Bottom */}
          {!collapsed && (
            <div style={{
              padding: '0.5rem 0.8rem', borderTop: `1px solid ${T.borderLt}`,
              fontSize: '0.54rem', color: T.faint,
              fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6,
            }}>
              <div style={{ fontWeight: 600, color: T.muted, marginBottom: '0.05rem' }}>Soppadop CMS</div>
              <div style={{ opacity: 0.5 }}>v1.0 Editorial</div>
            </div>
          )}
        </aside>

        {/* ═══ CONTENT ═══════════════════════════════════════ */}
        <div style={{
          flex: 1,
          marginLeft: isMobile ? 0 : sidebarW,
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
          minHeight: 'calc(100vh - 76px - 30px)',
        }}>
          <main key={location.pathname} className="page-enter" style={{
            flex: 1,
            padding: isMobile ? '1.25rem 1rem' : '1.5rem 2rem',
            maxWidth: '1280px', width: '100%', margin: '0 auto',
          }}>
            {/* Breadcrumb */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              marginBottom: '1.25rem', fontSize: '0.58rem', color: T.faint,
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              <span style={{
                width: '12px', height: '2px', background: T.primary,
                borderRadius: '1px', display: 'inline-block',
              }} />
              <span>admin</span>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ color: T.muted, fontWeight: 600 }}>
                {location.pathname.replace('/admin/', '') || 'home'}
              </span>
            </div>

            <Outlet />
          </main>
        </div>
      </div>

      {/* ═══ FOOTER ══════════════════════════════════════════ */}
      <footer style={{
        height: '30px', background: T.dark, color: T.darkMuted,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 1.25rem', fontSize: '0.54rem',
        fontFamily: "'JetBrains Mono', monospace",
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      }}>
        <span>&copy; {new Date().getFullYear()} Soppadop</span>
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: T.emerald, boxShadow: `0 0 6px ${T.emerald}40`,
            }} />
            Online
          </span>
          <span style={{ opacity: 0.35 }}>{location.pathname}</span>
        </div>
      </footer>

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
            padding: '0.5rem 1rem', background: T.rose, color: '#fff',
            border: 'none', borderRadius: '6px', fontSize: '0.8rem',
            cursor: 'pointer', fontWeight: 600,
          }}>
            {t('header.logout')}
          </button>
        </div>
      </Modal>
    </div>
  )
}

/* ─── NavGroup ─────────────────────────────────────────────────── */
function NavGroup({
  items, collapsed, label, colors,
}: {
  items: NavItem[]
  collapsed: boolean
  label: string
  colors: { accent: string; soft: string }
}) {
  const { t } = useTranslation()
  if (items.length === 0) return null

  return (
    <div style={{ marginBottom: '0.4rem' }}>
      {!collapsed && (
        <div style={{
          fontSize: '0.52rem', textTransform: 'uppercase', letterSpacing: '0.1em',
          color: colors.accent, padding: '0.3rem 0.55rem 0.18rem',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700, opacity: 0.65,
        }}>
          {label}
        </div>
      )}

      {items.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : '0.45rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0.4rem' : '0.36rem 0.55rem',
            borderRadius: '6px', marginBottom: '1px',
            textDecoration: 'none', fontSize: '0.76rem',
            fontWeight: isActive ? 600 : 450,
            color: isActive ? colors.accent : T.inkSoft,
            background: isActive ? colors.soft : 'transparent',
            transition: 'all 0.15s ease',
            position: 'relative',
          })}
          title={collapsed ? t(item.labelKey) : undefined}
        >
          {({ isActive }) => (
            <>
              {isActive && !collapsed && (
                <span style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: '2.5px', height: '12px', borderRadius: '0 2px 2px 0',
                  background: colors.accent,
                }} />
              )}
              <span style={{
                width: '18px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
                opacity: isActive ? 1 : 0.5,
              }}>{item.icon}</span>
              {!collapsed && (
                <span style={{
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{t(item.labelKey)}</span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  )
}

/* ─── Mast link ────────────────────────────────────────────────── */
const mastLinkStyle: React.CSSProperties = {
  fontSize: '0.7rem', color: '#78716c', textDecoration: 'none',
  fontWeight: 500, fontFamily: "'Inter', sans-serif",
  display: 'flex', alignItems: 'center', gap: '0.22rem',
  padding: '0.2rem 0.4rem', borderRadius: '5px',
}
