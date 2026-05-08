import { Link } from 'react-router-dom'

export default function ServerErrorPage() {
  return (
    <div className="page-enter" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: '1rem',
    }}>
      <div style={{ fontSize: '6rem', fontWeight: 700, color: '#e5e7eb' }}>500</div>
      <h2 style={{ color: '#374151' }}>Server Error</h2>
      <p style={{ color: '#6b7280' }}>Something went wrong on our end. Please try again later.</p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => window.location.reload()} style={{
          padding: '0.75rem 1.5rem', background: '#3b82f6', color: '#fff',
          borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500,
        }}>
          Reload Page
        </button>
        <Link to="/admin/dashboard" style={{
          padding: '0.75rem 1.5rem', background: '#e5e7eb', color: '#374151',
          borderRadius: '6px', textDecoration: 'none', fontWeight: 500,
        }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
