import { theme as T } from '@/styles/theme'

export default function StatusBadge({ status }: { status: 'draft' | 'published' }) {
  const isPublished = status === 'published'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
      padding: '0.15rem 0.5rem', borderRadius: '5px',
      fontSize: '0.58rem', fontWeight: 600,
      background: isPublished ? T.emeraldSoft : T.amberSoft,
      color: isPublished ? T.emeraldText : T.amberText,
      border: `1px solid ${isPublished ? T.emeraldRing : T.amberRing}`,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: isPublished ? T.emerald : T.amber,
      }} />
      {isPublished ? 'Published' : 'Draft'}
    </span>
  )
}
