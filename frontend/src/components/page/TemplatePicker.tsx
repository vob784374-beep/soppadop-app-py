import { useState } from 'react'
import { Modal, Button, Badge } from '@/components/ui'
import { theme as T } from '@/styles/theme'
import { Grid, List, Play, Star, Image, Plus, Layout, File } from '@/components/ui/Icons'
import type { Template, TemplateData } from '@/types'

const LAYOUT_ICONS: Record<string, React.ReactNode> = {
  grid: <Grid size={14} color={T.primary} />,
  list: <List size={14} color={T.accent} />,
  hero: <Star size={14} color={T.amber} />,
  carousel: <Play size={14} color={T.rose} />,
}

interface TemplatePickerProps {
  open: boolean
  onClose: () => void
  templates: TemplateData
  onApplySection: (templateId: string) => Promise<void>
  onApplyPage: (templateId: string) => Promise<void>
  sectionTitle?: string | null
}

export default function TemplatePicker({
  open, onClose, templates, onApplySection, onApplyPage, sectionTitle,
}: TemplatePickerProps) {
  const [tab, setTab] = useState<'section' | 'page'>('section')
  const [selected, setSelected] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [preview, setPreview] = useState<Template | null>(null)

  const isAttachMode = !!sectionTitle
  const list = tab === 'section' ? templates.section_templates : templates.page_templates

  const handleApply = async () => {
    if (!selected) return
    setApplying(true)
    if (tab === 'section') {
      await onApplySection(selected)
    } else {
      await onApplyPage(selected)
    }
    setApplying(false)
    setSelected(null)
    setPreview(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Templates">
      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem', marginBottom: '1rem',
        background: T.bgSubtle, borderRadius: '8px', padding: '0.2rem',
      }}>
        <TabButton active={tab === 'section'} onClick={() => { setTab('section'); setSelected(null); setPreview(null) }}>
          <Layout size={13} /> Section Templates
        </TabButton>
        <TabButton active={tab === 'page'} onClick={() => { setTab('page'); setSelected(null); setPreview(null) }}>
          <File size={13} /> Page Templates
        </TabButton>
      </div>

      {tab === 'section' && isAttachMode && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', color: T.muted }}>
          Add content to section: <strong style={{ color: T.ink }}>{sectionTitle}</strong>
        </p>
      )}
      {tab === 'section' && !isAttachMode && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', color: T.muted }}>
          Create a new section from a content template.
        </p>
      )}
      {tab === 'page' && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', color: T.muted }}>
          Create an entire page with multiple sections and content at once.
        </p>
      )}

      {/* Template Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {list.map(t => (
          <div
            key={t.id}
            onClick={() => { setSelected(t.id); setPreview(t) }}
            style={{
              padding: '0.65rem', borderRadius: '8px', cursor: 'pointer',
              border: `1px solid ${selected === t.id ? T.primaryRing : T.border}`,
              background: selected === t.id ? T.primarySoft : T.surface,
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
              {tab === 'section' ? LAYOUT_ICONS[t.layout || 'grid'] : <File size={14} color={T.primary} />}
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: T.ink }}>{t.name}</span>
            </div>
            <div style={{ fontSize: '0.6rem', color: T.muted, marginBottom: '0.3rem' }}>{t.description}</div>
            <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
              {t.section_type && <Badge color="blue">{t.section_type}</Badge>}
              {t.layout && <Badge color="gray">{t.layout}</Badge>}
              {t.contents && <Badge color="gray">{t.contents.length} items</Badge>}
              {t.sections && <Badge color="green">{t.sections.length} sections</Badge>}
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      {preview && (
        <div style={{
          padding: '0.65rem', borderRadius: '8px',
          background: T.bgSubtle, border: `1px solid ${T.border}`,
          marginBottom: '1rem', maxHeight: '250px', overflowY: 'auto',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: T.ink, marginBottom: '0.4rem' }}>
            Preview: {preview.name}
          </div>

          {/* Section template preview */}
          {preview.contents && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {preview.contents.map((c, i) => (
                <PreviewItem key={i} title={c.title} subtitle={c.subtitle} image_url={c.image_url} />
              ))}
            </div>
          )}

          {/* Page template preview */}
          {preview.sections && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {preview.sections.map((sec, si) => (
                <div key={si}>
                  <div style={{
                    fontSize: '0.62rem', fontWeight: 700, color: T.primary,
                    marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}>
                    {LAYOUT_ICONS[sec.layout] || <Grid size={12} />}
                    {sec.title}
                    <Badge color="gray">{sec.contents.length}</Badge>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.75rem' }}>
                    {sec.contents.map((c, ci) => (
                      <PreviewItem key={ci} title={c.title} subtitle={c.subtitle} image_url={c.image_url} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" loading={applying} disabled={!selected} onClick={handleApply}>
          <Plus size={14} /> {tab === 'page' ? 'Create Page' : isAttachMode ? 'Add to Section' : 'Create Section'}
        </Button>
      </div>
    </Modal>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '0.4rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
      background: active ? T.surface : 'transparent',
      color: active ? T.ink : T.muted, fontWeight: 600, fontSize: '0.7rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
      boxShadow: active ? T.shadowSm : 'none',
    }}>{children}</button>
  )
}

function PreviewItem({ title, subtitle, image_url }: { title?: string; subtitle?: string; image_url?: string }) {
  return (
    <div style={{
      display: 'flex', gap: '0.4rem', padding: '0.3rem',
      background: T.surface, borderRadius: '5px', border: `1px solid ${T.borderLt}`,
    }}>
      {image_url ? (
        <img src={image_url} alt="" style={{ width: 32, height: 32, borderRadius: '4px', objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: 32, height: 32, borderRadius: '4px',
          background: T.bgSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Image size={12} color={T.faint} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 600, color: T.ink }}>{title || 'Untitled'}</div>
        {subtitle && <div style={{ fontSize: '0.54rem', color: T.muted }}>{subtitle}</div>}
      </div>
    </div>
  )
}
