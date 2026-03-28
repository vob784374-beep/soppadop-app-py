export default function Footer() {
  return (
    <footer style={{
      padding: '1rem 1.5rem',
      borderTop: '1px solid #e5e7eb',
      background: '#fff',
      textAlign: 'center',
      fontSize: '0.8rem',
      color: '#9ca3af',
    }}>
      Soppadop App &copy; {new Date().getFullYear()}
    </footer>
  )
}
