const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: '#dbeafe', text: '#1e40af' },
  green: { bg: '#d1fae5', text: '#065f46' },
  red: { bg: '#fee2e2', text: '#991b1b' },
  yellow: { bg: '#fef3c7', text: '#92400e' },
  gray: { bg: '#f3f4f6', text: '#374151' },
  purple: { bg: '#ede9fe', text: '#5b21b6' },
}

export default function Badge({ color = 'blue', children }: { color?: string; children: React.ReactNode }) {
  const c = colorMap[color] || colorMap.blue
  return (
    <span style={{
      display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '999px',
      fontSize: '0.75rem', fontWeight: 500, background: c.bg, color: c.text,
    }}>
      {children}
    </span>
  )
}
