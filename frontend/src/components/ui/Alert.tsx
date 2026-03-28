export default function Alert({ type = 'info', message, onClose }: {
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose?: () => void
}) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    success: { bg: '#d1fae5', border: '#22c55e', text: '#065f46' },
    error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  }
  const c = colors[type]
  return (
    <div style={{
      padding: '0.75rem 1rem', background: c.bg, borderLeft: `3px solid ${c.border}`,
      borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem',
    }}>
      <span style={{ color: c.text, fontSize: '0.875rem' }}>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', fontSize: '1rem' }}>&times;</button>}
    </div>
  )
}
