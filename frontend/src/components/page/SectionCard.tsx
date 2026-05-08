import { theme as T } from '@/styles/theme'
import { Badge, Button } from '@/components/ui'
import { Edit, Trash, Eye, EyeOff, ExternalLink } from '@/components/ui/Icons'
import StatusBadge from './StatusBadge'
import type { PageSection } from '@/types'

const SECTION_TYPES: Record<string, { color: string; bg: string }> = {
  general: { color: T.muted, bg: T.bgSubtle },
  blog: { color: T.primaryText, bg: T.primarySoft },
  gallery: { color: T.accentText, bg: T.accentSoft },
  travel: { color: T.tealText, bg: T.tealSoft },
  review: { color: T.amberText, bg: T.amberSoft },
  video: { color: T.roseText, bg: T.roseSoft },
  featured: { color: T.emeraldText, bg: T.emeraldSoft },
}

interface SectionCardProps {
  section: PageSection
  selected: boolean
  onSelect: (id: number) => void
  onEdit: (section: PageSection) => void
  onDelete: (section: PageSection) => void
  onTogglePublish: (section: PageSection) => void
}

export default function SectionCard({
  section, selected, onSelect, onEdit, onDelete, onTogglePublish,
}: SectionCardProps) {
  void SECTION_TYPES

  return (
    <div
      onClick={() => onSelect(section.id)}
      style={{
        background: selected ? T.primarySoft : T.surface,
        border: `1px solid ${selected ? T.primaryRing : T.border}`,
        borderRadius: '8px',
        padding: '0.65rem 0.75rem',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: section.is_visible ? T.emerald : T.faint,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: '0.78rem', fontWeight: 700, color: T.ink,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{section.title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
            <Badge color={section.section_type === 'general' ? 'gray' : 'blue'}>{section.section_type}</Badge>
            <Badge color="gray">{section.layout}</Badge>
            <StatusBadge status={section.status} />
            <span style={{ fontSize: '0.58rem', color: T.faint }}>
              {section.content_count ?? 0} items
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
          {section.status === 'published' && section.is_visible && (
            <a href={`/#section-${section.id}`} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="View on public page"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: '6px', border: 'none',
                background: T.primarySoft, color: T.primary, cursor: 'pointer',
                transition: 'all 0.15s', textDecoration: 'none',
              }}>
              <ExternalLink size={12} />
            </a>
          )}
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onTogglePublish(section) }}
            title={section.status === 'published' ? 'Unpublish' : 'Publish'}>
            {section.status === 'published' ? <Eye size={12} /> : <EyeOff size={12} />}
          </Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(section) }}><Edit size={12} /></Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(section) }}><Trash size={12} /></Button>
        </div>
      </div>
    </div>
  )
}
