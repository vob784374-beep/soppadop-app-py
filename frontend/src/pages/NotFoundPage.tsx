import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="page-enter" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: '1rem',
    }}>
      <div style={{ fontSize: '6rem', fontWeight: 700, color: '#e5e7eb' }}>404</div>
      <h2 style={{ color: '#374151' }}>Page Not Found</h2>
      <p style={{ color: '#6b7280' }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard" style={{
        padding: '0.75rem 1.5rem', background: '#3b82f6', color: '#fff',
        borderRadius: '6px', textDecoration: 'none', fontWeight: 500,
      }}>
        Back to Dashboard
      </Link>
    </div>
  )
}
