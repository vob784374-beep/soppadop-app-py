import { theme as T } from '@/styles/theme'

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: T.primarySoft,   text: T.primaryText,   border: T.primaryRing },
  green:  { bg: T.emeraldSoft,   text: T.emeraldText,   border: T.emeraldRing },
  red:    { bg: T.roseSoft,      text: T.roseText,      border: T.roseRing },
  yellow: { bg: T.amberSoft,     text: T.amberText,     border: T.amberRing },
  gray:   { bg: T.bgSubtle,      text: T.muted,         border: T.border },
  purple: { bg: T.accentSoft,    text: T.accentText,    border: T.accentRing },
  orange: { bg: T.amberSoft,     text: T.amberText,     border: T.amberRing },
  teal:   { bg: T.tealSoft,      text: T.tealText,      border: T.tealRing },
}

export default function Badge({ color = 'blue', children }: { color?: string; children: React.ReactNode }) {
  const c = colorMap[color] || colorMap.blue
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.12rem 0.5rem',
      borderRadius: '5px',
      fontSize: '0.66rem',
      fontWeight: 600,
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      letterSpacing: '0.02em',
      fontFamily: "'Inter', sans-serif",
    }}>
      {children}
    </span>
  )
}
