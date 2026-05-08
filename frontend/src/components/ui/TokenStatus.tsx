import { useState, useEffect, useCallback, useRef } from 'react'
import { theme as T } from '@/styles/theme'
import { authService } from '@/services'
import { Clock, RefreshCw, AlertTriangle, Check, LogOut } from './Icons'
import Button from './Button'

interface TokenStatusProps {
  onExpired?: () => void
}

export default function TokenStatus({ onExpired }: TokenStatusProps) {
  const [decoded, setDecoded] = useState(authService.decodeToken())
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))
  const [refreshing, setRefreshing] = useState(false)
  const [status, setStatus] = useState<'active' | 'expiring' | 'expired'>('active')
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const expiredRef = useRef(false)

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(interval)
  }, [])

  // Recalculate status + force logout on expiry (once only)
  useEffect(() => {
    if (!decoded || expiredRef.current) return
    const remaining = decoded.exp - now
    if (remaining <= 0) {
      expiredRef.current = true
      setStatus('expired')
      if (onExpired) {
        onExpired()
      } else {
        authService.clearTokens()
        window.location.href = '/admin/login'
      }
    } else if (remaining < 300) {
      setStatus('expiring')
    } else {
      setStatus('active')
    }
  }, [now, decoded, onExpired])

  // Manual refresh — user must click, no auto-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await authService.refreshToken()
      const newDecoded = authService.decodeToken()
      setDecoded(newDecoded)
      setNow(Math.floor(Date.now() / 1000))
      setLastRefresh(new Date().toLocaleTimeString())
    } catch {
      // refresh failed — force logout
      authService.clearTokens()
      window.location.href = '/admin/login'
    }
    setRefreshing(false)
  }, [])

  const handleLoginAgain = useCallback(() => {
    authService.clearTokens()
    window.location.href = '/admin/login'
  }, [])

  if (!decoded) return null

  const totalDuration = decoded.exp - decoded.iat
  const elapsed = now - decoded.iat
  const remaining = decoded.exp - now
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))

  const formatTime = (secs: number) => {
    if (secs <= 0) return '00:00'
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const formatDuration = (secs: number) => {
    if (secs <= 0) return 'Expired'
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const barColor = status === 'expired' ? T.rose
    : status === 'expiring' ? T.amber
    : T.emerald

  const bgColor = status === 'expired' ? T.roseSoft
    : status === 'expiring' ? T.amberSoft
    : T.emeraldSoft

  return (
    <div style={{
      background: T.surface,
      borderRadius: '12px',
      border: `1px solid ${T.border}`,
      padding: '1.1rem',
      boxShadow: T.shadowSm,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '0.85rem',
      }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: T.ink, margin: 0 }}>
          Token Status
        </h3>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
          padding: '0.15rem 0.5rem', borderRadius: '6px',
          fontSize: '0.6rem', fontWeight: 600,
          background: bgColor, color: barColor,
          border: `1px solid ${barColor}40`,
        }}>
          {status === 'expired' ? <AlertTriangle size={10} /> : <Check size={10} />}
          {status === 'expired' ? 'Expired' : status === 'expiring' ? 'Expiring Soon' : 'Active'}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '6px', borderRadius: '3px', background: T.bgSubtle,
        marginBottom: '0.75rem', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: '3px',
          width: `${progress}%`,
          background: barColor,
          transition: 'width 1s linear, background 0.3s',
        }} />
      </div>

      {/* Time info */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: '0.5rem', marginBottom: '0.85rem',
      }}>
        <TimeBlock
          icon={<Clock size={12} color={T.muted} />}
          label="Issued"
          value={new Date(decoded.iat * 1000).toLocaleTimeString()}
        />
        <TimeBlock
          icon={<Clock size={12} color={barColor} />}
          label="Remaining"
          value={formatDuration(remaining)}
          highlight={barColor}
        />
        <TimeBlock
          icon={<Clock size={12} color={T.muted} />}
          label="Expires"
          value={new Date(decoded.exp * 1000).toLocaleTimeString()}
        />
      </div>

      {/* Big countdown */}
      <div style={{
        textAlign: 'center', padding: '0.75rem',
        background: bgColor, borderRadius: '8px',
        marginBottom: '0.75rem',
      }}>
        <div style={{
          fontSize: '0.54rem', color: T.muted, textTransform: 'uppercase',
          letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600, marginBottom: '0.25rem',
        }}>
          {status === 'expired' ? 'Token expired' : 'Time remaining'}
        </div>
        <div style={{
          fontSize: '1.5rem', fontWeight: 800, color: barColor,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '-0.02em',
        }}>
          {status === 'expired' ? '00:00' : formatTime(remaining)}
        </div>
        {status === 'expiring' && (
          <div style={{
            fontSize: '0.62rem', color: T.amberText, marginTop: '0.15rem',
            fontWeight: 600,
          }}>
            Token will expire soon
          </div>
        )}
        {status === 'expired' && (
          <div style={{
            fontSize: '0.62rem', color: T.roseText, marginTop: '0.15rem',
            fontWeight: 600,
          }}>
            Session expired — please login again
          </div>
        )}
      </div>

      {/* Action button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {status === 'expired' ? (
          <Button variant="danger" size="sm" onClick={handleLoginAgain}>
            <LogOut size={14} /> Login Again
          </Button>
        ) : (
          <Button
            variant={status === 'expiring' ? 'warning' : 'outline'}
            size="sm"
            loading={refreshing}
            onClick={handleRefresh}
          >
            <RefreshCw size={14} /> Refresh Token
          </Button>
        )}
        {lastRefresh && (
          <span style={{ fontSize: '0.62rem', color: T.muted }}>
            Last refreshed: {lastRefresh}
          </span>
        )}
      </div>
    </div>
  )
}

function TimeBlock({ icon, label, value, highlight }: {
  icon: React.ReactNode; label: string; value: string; highlight?: string
}) {
  return (
    <div style={{
      textAlign: 'center', padding: '0.5rem',
      background: T.bgSubtle, borderRadius: '6px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.2rem', marginBottom: '0.2rem',
      }}>
        {icon}
        <span style={{
          fontSize: '0.5rem', color: T.muted, textTransform: 'uppercase',
          letterSpacing: '0.06em', fontWeight: 600,
        }}>{label}</span>
      </div>
      <div style={{
        fontSize: '0.72rem', fontWeight: 700,
        color: highlight || T.inkSoft,
        fontFamily: "'JetBrains Mono', monospace",
      }}>{value}</div>
    </div>
  )
}
