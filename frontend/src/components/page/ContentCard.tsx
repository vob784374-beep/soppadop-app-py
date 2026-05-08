import { theme as T } from '@/styles/theme'
import { Button, Badge } from '@/components/ui'
import { Edit, Trash, Image } from '@/components/ui/Icons'
import type { SectionContent } from '@/types'

interface ContentCardProps {
  content: SectionContent
  onEdit: (content: SectionContent) => void
  onDelete: (content: SectionContent) => void
}

export default function ContentCard({ content, onEdit, onDelete }: ContentCardProps) {
  return (
    <div style={{
      display: 'flex', gap: '0.75rem',
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: '8px', padding: '0.65rem',
    }}>
      {/* Thumbnail */}
      <div style={{
        width: 64, height: 64, borderRadius: '6px',
        background: T.bgSubtle, flexShrink: 0,
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {content.image_url ? (
          <img src={content.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Image size={20} color={T.faint} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: content.is_visible ? T.emerald : T.faint,
          }} />
          <span style={{
            fontSize: '0.76rem', fontWeight: 700, color: T.ink,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{content.title || 'Untitled'}</span>
        </div>
        {content.subtitle && (
          <div style={{ fontSize: '0.65rem', color: T.muted, marginBottom: '0.2rem' }}>{content.subtitle}</div>
        )}
        {content.body && (
          <div style={{
            fontSize: '0.62rem', color: T.faint, lineHeight: 1.4,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{content.body}</div>
        )}
        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
          {content.tags && content.tags.split(',').map(t => (
            <Badge key={t} color="gray">{t.trim()}</Badge>
          ))}
          {content.author && <Badge color="blue">{content.author}</Badge>}
          {!content.is_visible && <Badge color="red">Hidden</Badge>}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flexShrink: 0 }}>
        <Button size="sm" variant="ghost" onClick={() => onEdit(content)}><Edit size={12} /></Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(content)}><Trash size={12} /></Button>
      </div>
    </div>
  )
}
