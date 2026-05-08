import { theme as T } from '@/styles/theme'
import { File, Eye, Folder, Check } from '@/components/ui/Icons'

interface StatsBarProps {
  totalSections: number
  publishedCount: number
  totalContents: number
  selectedTitle: string | null
}

export default function StatsBar({ totalSections, publishedCount, totalContents, selectedTitle }: StatsBarProps) {
  const stats = [
    { label: 'Sections', value: String(totalSections), icon: <Folder size={14} color={T.primary} />, bg: T.primarySoft },
    { label: 'Published', value: String(publishedCount), icon: <Check size={14} color={T.emerald} />, bg: T.emeraldSoft },
    { label: 'Contents', value: String(totalContents), icon: <File size={14} color={T.accent} />, bg: T.accentSoft },
    { label: 'Selected', value: selectedTitle || 'None', icon: <Eye size={14} color={T.amber} />, bg: T.amberSoft },
  ]

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem',
      marginBottom: '1rem',
    }}>
      {stats.map(s => (
        <div key={s.label} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 0.65rem', borderRadius: '8px',
          background: T.surface, border: `1px solid ${T.border}`,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '6px',
            background: s.bg, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>{s.icon}</div>
          <div>
            <div style={{ fontSize: '0.5rem', color: T.faint, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: T.ink, textTransform: 'capitalize' }}>{s.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
