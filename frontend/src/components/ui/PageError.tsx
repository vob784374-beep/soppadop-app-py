export default function PageError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="page-enter" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '4rem 1rem', gap: '1rem',
    }}>
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <p style={{ color: '#ef4444', fontWeight: 500 }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{
          padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff',
          borderRadius: '4px', border: 'none', cursor: 'pointer',
        }}>
          Try Again
        </button>
      )}
    </div>
  )
}
