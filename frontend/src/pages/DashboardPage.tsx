import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { theme as T } from '@/styles/theme'
import { TokenStatus, useToast, Button, Modal } from '@/components/ui'
import { authService } from '@/services'
import {
  Shield, Check, Star, Lock, User, Users, Folder, BookOpen,
  Download, AlertTriangle, Zap,
} from '@/components/ui/Icons'

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [revoking, setRevoking] = useState(false)

  const isAdmin = ['admin', 'manager'].includes(user?.role?.name || '')
  const isOwner = user?.is_owner
  const perms = user?.role?.permissions || []

  const initials = (user?.username || 'U').charAt(0).toUpperCase()
  const joinDate = user?.created_at?.slice(0, 10) || '-'

  const handleRevokeAll = async () => {
    setRevoking(true)
    try {
      const res = await authService.revokeAllLowerRoleTokens()
      toast.success(res.message)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to revoke tokens')
    }
    setRevoking(false)
    setShowRevokeModal(false)
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: '1.5rem', fontWeight: 800, color: T.ink,
          letterSpacing: '-0.025em', marginBottom: '0.2rem',
        }}>{t('dashboard.title')}</h1>
        <p style={{ fontSize: '0.82rem', color: T.muted }}>
          Welcome back, <span style={{ color: T.inkSoft, fontWeight: 600 }}>{user?.username}</span>
        </p>
      </div>

      {/* ═══ STATS ════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '0.75rem', marginBottom: '1.25rem',
      }}>
        <StatCard label="Role" value={user?.role?.name || '-'}
          icon={<Shield size={18} color={T.primary} />} bg={T.primarySoft} />
        <StatCard label="Status" value={user?.is_active ? 'Active' : 'Inactive'}
          icon={user?.is_active ? <Check size={18} color={T.emerald} /> : <AlertTriangle size={18} color={T.rose} />}
          bg={user?.is_active ? T.emeraldSoft : T.roseSoft} />
        <StatCard label="Account" value={user?.is_owner ? 'Owner' : 'Member'}
          icon={user?.is_owner ? <Star size={18} color={T.amber} /> : <User size={18} color={T.muted} />}
          bg={user?.is_owner ? T.amberSoft : T.bgSubtle} />
        <StatCard label="Permissions" value={`${perms.length} granted`}
          icon={<Lock size={18} color={T.accent} />} bg={T.accentSoft} />
      </div>

      {/* ═══ MAIN GRID ════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

        {/* Profile */}
        <div style={{
          background: T.surface,
          borderRadius: '12px',
          border: `1px solid ${T.border}`,
          boxShadow: T.shadowSm,
          overflow: 'hidden',
        }}>
          {/* Top section - centered avatar */}
          <div style={{
            background: T.gradPrimary,
            padding: '1.5rem 1.25rem 2.5rem',
            textAlign: 'center',
            position: 'relative',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.2rem',
              margin: '0 auto',
              letterSpacing: '-0.02em',
            }}>{initials}</div>
          </div>

          {/* Info section */}
          <div style={{
            padding: '0 1.25rem 1.25rem',
            marginTop: '-1rem',
          }}>
            {/* Name + email centered */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{
                fontWeight: 800,
                fontSize: '1rem',
                color: T.ink,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>{user?.username}</div>
              <div style={{
                fontSize: '0.72rem',
                color: T.muted,
                marginTop: '0.15rem',
              }}>{user?.email}</div>
            </div>

            {/* Badges row centered */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.35rem',
              marginBottom: '1rem',
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.15rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.6rem',
                fontWeight: 600,
                background: T.primarySoft,
                color: T.primaryText,
                border: `1px solid ${T.primaryRing}`,
              }}>{user?.role?.name}</span>
              {user?.is_owner && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.15rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  background: T.amberSoft,
                  color: T.amberText,
                  border: `1px solid ${T.amberRing}`,
                }}>
                  <Star size={9} /> Owner
                </span>
              )}
              {user?.role?.is_super_admin && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.15rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  background: T.roseSoft,
                  color: T.roseText,
                  border: `1px solid ${T.roseRing}`,
                }}>
                  <Shield size={9} /> Super Admin
                </span>
              )}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.15rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.6rem',
                fontWeight: 600,
                background: '#e9d5ff',
                color: '#6b21a8',
                border: '1px solid #d8b4fe',
              }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#8b5cf6' }} />
                ABAC Enabled
              </span>
            </div>

            {/* Info items - vertical list */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              <InfoItem label="Username" value={user?.username} />
              <InfoItem label="Email" value={user?.email} />
              <InfoItem label="Joined" value={joinDate} />
            </div>

            {/* ABAC Attributes */}
            {(user?.attributes && Object.keys(user.attributes).length > 0) && (
              <div style={{
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: `1px solid ${T.borderLt}`,
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: T.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                  Attributes (ABAC)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {Object.entries(user.attributes).map(([key, val]) => (
                    <span key={key} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                      padding: '0.15rem 0.5rem', borderRadius: '4px',
                      fontSize: '0.62rem', fontWeight: 500,
                      background: T.accentSoft, color: T.accentText,
                      border: `1px solid ${T.accentRing}`,
                    }}>
                      {key} = {String(val)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Permissions */}
        <div style={{
          background: T.surface, borderRadius: '12px',
          border: `1px solid ${T.border}`, padding: '1.1rem',
          boxShadow: T.shadowSm,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: T.ink, margin: 0 }}>
              {t('dashboard.permissions')}
            </h3>
            <span style={{
              fontSize: '0.56rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
              background: T.accentSoft, color: T.accentText,
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
              border: `1px solid ${T.accentRing}`,
            }}>{perms.length}</span>
          </div>

          {perms.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {perms.map(p => {
                const rc = resourceColors(p.resource)
                return (
                  <span key={p.id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                    padding: '0.2rem 0.5rem', borderRadius: '5px',
                    fontSize: '0.66rem', fontWeight: 500,
                    background: rc.bg, color: rc.text,
                    border: `1px solid ${rc.border}`,
                  }}>
                    <Check size={9} />
                    {p.name}
                  </span>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: T.faint, fontSize: '0.78rem' }}>
              No permissions assigned
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: T.surface, borderRadius: '12px',
          border: `1px solid ${T.border}`, padding: '1.1rem',
          gridColumn: '1 / -1', boxShadow: T.shadowSm,
        }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: T.ink, marginBottom: '0.85rem' }}>
            Quick Actions
          </h3>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.6rem',
          }}>
            <ActionCard label="Profile" desc="Manage account" icon={<User size={20} color={T.primary} />}
              onClick={() => navigate('/admin/profile')} accent={T.primary} bg={T.primarySoft} />
            {isAdmin && <ActionCard label="Users" desc="Manage accounts" icon={<Users size={20} color={T.teal} />}
              onClick={() => navigate('/admin/users')} accent={T.teal} bg={T.tealSoft} />}
            {isAdmin && <ActionCard label="Roles" desc="Configure access" icon={<Shield size={20} color={T.accent} />}
              onClick={() => navigate('/admin/roles')} accent={T.accent} bg={T.accentSoft} />}
            {isAdmin && <ActionCard label="Resources" desc="Manage files" icon={<Folder size={20} color={T.amber} />}
              onClick={() => navigate('/admin/resources')} accent={T.amber} bg={T.amberSoft} />}
            {isAdmin && <ActionCard label="Page Admin" desc="Edit content" icon={<BookOpen size={20} color={T.rose} />}
              onClick={() => navigate('/admin/page-admin')} accent={T.rose} bg={T.roseSoft} />}
            {isAdmin && <ActionCard label="ABAC Rules" desc="Policy rules" icon={<Zap size={20} color="#8b5cf6" />}
              onClick={() => navigate('/admin/abac')} accent="#8b5cf6" bg="#e9d5ff" />}
            {isOwner && <ActionCard label="Backup" desc="System backup" icon={<Download size={20} color={T.emerald} />}
              onClick={() => navigate('/admin/backup')} accent={T.emerald} bg={T.emeraldSoft} />}
            {isOwner && <ActionCard label="Revoke Tokens" desc="Force logout all users" icon={<Zap size={20} color={T.rose} />}
              onClick={() => setShowRevokeModal(true)} accent={T.rose} bg={T.roseSoft} />}
          </div>
        </div>

        {/* Token Status */}
        <div style={{ gridColumn: '1 / -1' }}>
          <TokenStatus onExpired={() => {
            authService.clearTokens()
            window.location.href = '/admin/login'
          }} />
        </div>
      </div>

      {/* Revoke Confirmation Modal */}
      <Modal open={showRevokeModal} onClose={() => setShowRevokeModal(false)} title="Revoke All Tokens">
        <p style={{ margin: '0 0 1.25rem', color: T.muted, fontSize: '0.875rem' }}>
          This will revoke tokens of <strong>all users with lower roles</strong> (admin, manager, client).
          They will be forced to log in again.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" onClick={() => setShowRevokeModal(false)}>Cancel</Button>
          <Button variant="danger" size="sm" loading={revoking} onClick={handleRevokeAll}>
            <Zap size={14} /> Revoke All
          </Button>
        </div>
      </Modal>
    </div>
  )
}

/* ─── Stat Card ────────────────────────────────────────────────── */
function StatCard({ label, value, icon, bg }: {
  label: string; value: string; icon: React.ReactNode; bg: string
}) {
  return (
    <div style={{
      background: T.surface,
      borderRadius: '10px',
      border: `1px solid ${T.border}`,
      padding: '0.75rem 0.85rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      boxShadow: T.shadowSm,
    }}>
      <div style={{
        width: 34,
        height: 34,
        borderRadius: '8px',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>{icon}</div>
      <div style={{ lineHeight: 1.25 }}>
        <div style={{
          fontSize: '0.54rem',
          color: T.faint,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          lineHeight: 1,
          marginBottom: '0.15rem',
        }}>{label}</div>
        <div style={{
          fontSize: '0.82rem',
          fontWeight: 700,
          color: T.ink,
          textTransform: 'capitalize',
          lineHeight: 1,
        }}>{value}</div>
      </div>
    </div>
  )
}

/* ─── Action Card ──────────────────────────────────────────────── */
function ActionCard({ label, desc, icon, onClick, accent, bg }: {
  label: string; desc: string; icon: React.ReactNode; onClick: () => void; accent: string; bg: string
}) {
  return (
    <button onClick={onClick} style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: '10px',
      padding: '0.8rem',
      cursor: 'pointer',
      textAlign: 'left',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      transition: 'all 0.15s ease',
      boxShadow: T.shadowSm,
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = accent
        ;(e.currentTarget as HTMLElement).style.boxShadow = `0 2px 12px ${accent}18`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = T.border
        ;(e.currentTarget as HTMLElement).style.boxShadow = T.shadowSm
      }}
    >
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '7px',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>{icon}</div>
      <div style={{ lineHeight: 1.25 }}>
        <div style={{
          fontSize: '0.76rem',
          fontWeight: 700,
          color: T.ink,
          lineHeight: 1,
          marginBottom: '0.15rem',
        }}>{label}</div>
        <div style={{
          fontSize: '0.62rem',
          color: T.faint,
          lineHeight: 1,
        }}>{desc}</div>
      </div>
    </button>
  )
}

/* ─── Info Item (vertical) ─────────────────────────────────────── */
function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.35rem 0',
      borderBottom: `1px solid ${T.borderLt}`,
    }}>
      <span style={{
        fontSize: '0.68rem',
        color: T.faint,
        fontWeight: 500,
        lineHeight: 1,
      }}>{label}</span>
      <span style={{
        fontSize: '0.72rem',
        color: T.inkSoft,
        fontWeight: 600,
        lineHeight: 1,
      }}>{value || '-'}</span>
    </div>
  )
}

/* ─── Resource colors ──────────────────────────────────────────── */
function resourceColors(resource: string) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    users:       { bg: T.tealSoft,       text: T.tealText,       border: T.tealRing },
    roles:       { bg: T.accentSoft,     text: T.accentText,     border: T.accentRing },
    resources:   { bg: T.amberSoft,      text: T.amberText,      border: T.amberRing },
    permissions: { bg: T.primarySoft,    text: T.primaryText,    border: T.primaryRing },
    backup:      { bg: T.emeraldSoft,    text: T.emeraldText,    border: T.emeraldRing },
  }
  return map[resource] || { bg: T.bgSubtle, text: T.muted, border: T.border }
}
