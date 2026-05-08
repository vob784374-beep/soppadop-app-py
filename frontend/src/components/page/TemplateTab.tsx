import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Badge } from '@/components/ui'
import { theme as T } from '@/styles/theme'
import { Grid, List, Play, Star, Image, Plus, Layout, File, Check } from '@/components/ui/Icons'
import type { Template, TemplateData } from '@/types'

const LAYOUT_ICONS: Record<string, React.ReactNode> = {
  grid: <Grid size={16} color={T.primary} />,
  list: <List size={16} color={T.accent} />,
  hero: <Star size={16} color={T.amber} />,
  carousel: <Play size={16} color={T.rose} />,
}

interface TemplateTabProps {
  templates: TemplateData
  onApplySection: (templateId: string) => Promise<void>
  onApplyPage: (templateId: string) => Promise<void>
  onAttachToSection: (templateId: string) => Promise<void>
  selectedSectionTitle: string | null
}

export default function TemplateTab({
  templates, onApplySection, onApplyPage, onAttachToSection, selectedSectionTitle,
}: TemplateTabProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'section' | 'page'>('section')
  const [selected, setSelected] = useState<Template | null>(null)
  const [applying, setApplying] = useState(false)

  const list = tab === 'section' ? templates.section_templates : templates.page_templates

  const handleApply = async () => {
    if (!selected) return
    setApplying(true)
    try {
      if (tab === 'section') {
        if (selectedSectionTitle) {
          await onAttachToSection(selected.id)
        } else {
          await onApplySection(selected.id)
        }
      } else {
        await onApplyPage(selected.id)
      }
      setSelected(null)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem', marginBottom: '1.25rem',
        background: T.bgSubtle, borderRadius: '10px', padding: '0.25rem',
        maxWidth: '400px',
      }}>
        <SubTab active={tab === 'section'} onClick={() => { setTab('section'); setSelected(null) }}>
          <Layout size={14} /> {t('pageAdmin.sectionTemplates', 'Section Templates')}
        </SubTab>
        <SubTab active={tab === 'page'} onClick={() => { setTab('page'); setSelected(null) }}>
          <File size={14} /> {t('pageAdmin.pageTemplates', 'Page Templates')}
        </SubTab>
      </div>

      {/* Description */}
      {tab === 'section' && selectedSectionTitle && (
        <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: T.muted }}>
          {t('pageAdmin.attachTemplateHint', 'Select a template to add content to section:')}{' '}
          <strong style={{ color: T.primary }}>{selectedSectionTitle}</strong>
        </p>
      )}
      {tab === 'section' && !selectedSectionTitle && (
        <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: T.muted }}>
          {t('pageAdmin.sectionTemplateHint', 'Create a new section from a content template.')}
        </p>
      )}
      {tab === 'page' && (
        <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: T.muted }}>
          {t('pageAdmin.pageTemplateHint', 'Create an entire page with multiple sections and content at once.')}
        </p>
      )}

      {/* Main Content: Grid + Preview */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* Template Grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: T.surface, borderRadius: '10px',
            border: `1px solid ${T.border}`, padding: '1rem',
          }}>
            {list.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <File size={36} color={T.faint} />
                <p style={{ color: T.faint, fontSize: '0.82rem', marginTop: '0.85rem' }}>
                  {t('pageAdmin.noTemplates', 'No templates available')}
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '0.75rem',
              }}>
                {list.map(tmpl => (
                  <TemplateCard
                    key={tmpl.id}
                    template={tmpl}
                    isSection={tab === 'section'}
                    selected={selected?.id === tmpl.id}
                    onSelect={() => setSelected(tmpl)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div style={{ flex: '0 0 320px' }}>
          <div style={{
            background: T.surface, borderRadius: '10px',
            border: `1px solid ${T.border}`, minHeight: '300px',
            display: 'flex', flexDirection: 'column',
          }}>
            {selected ? (
              <>
                {/* Preview Header */}
                <div style={{
                  padding: '0.75rem 1rem',
                  borderBottom: `1px solid ${T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: T.ink }}>
                      {selected.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: T.muted, marginTop: '0.15rem' }}>
                      {selected.description}
                    </div>
                  </div>
                </div>

                {/* Preview Body */}
                <div style={{ flex: 1, padding: '0.75rem 1rem', overflowY: 'auto', maxHeight: '400px' }}>
                  {/* Section template preview */}
                  {selected.contents && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {selected.contents.map((c, i) => (
                        <PreviewItem key={i} title={c.title} subtitle={c.subtitle} image_url={c.image_url} />
                      ))}
                    </div>
                  )}
                  {/* Page template preview */}
                  {selected.sections && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {selected.sections.map((sec, si) => (
                        <div key={si}>
                          <div style={{
                            fontSize: '0.68rem', fontWeight: 700, color: T.primary,
                            marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                          }}>
                            {LAYOUT_ICONS[sec.layout] || <Grid size={13} />}
                            {sec.title}
                            <Badge color="gray">{sec.contents.length}</Badge>
                          </div>
                          <div style={{
                            display: 'flex', flexDirection: 'column', gap: '0.2rem',
                            paddingLeft: '0.75rem',
                          }}>
                            {sec.contents.map((c, ci) => (
                              <PreviewItem key={ci} title={c.title} subtitle={c.subtitle} image_url={c.image_url} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview Footer */}
                <div style={{
                  padding: '0.75rem 1rem',
                  borderTop: `1px solid ${T.border}`,
                  display: 'flex', justifyContent: 'flex-end', gap: '0.5rem',
                }}>
                  <Button size="sm" loading={applying} onClick={handleApply}>
                    <Plus size={13} />{' '}
                    {tab === 'page'
                      ? t('pageAdmin.createPage', 'Create Page')
                      : selectedSectionTitle
                        ? t('pageAdmin.addToSection', 'Add to Section')
                        : t('pageAdmin.createSection', 'Create Section')}
                  </Button>
                </div>
              </>
            ) : (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem',
              }}>
                <Star size={36} color={T.faint} />
                <p style={{ color: T.faint, fontSize: '0.82rem', fontWeight: 500, marginTop: '0.85rem' }}>
                  {t('pageAdmin.selectTemplate', 'Select a template to preview')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Sub Tab ────────────────────────────────────────────── */
function SubTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '0.45rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
      background: active ? T.surface : 'transparent',
      color: active ? T.ink : T.muted, fontWeight: 600, fontSize: '0.75rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
      boxShadow: active ? T.shadowSm : 'none',
      transition: 'all 0.15s',
    }}>{children}</button>
  )
}

/* ─── Template Card ─────────────────────────────────────── */
function TemplateCard({ template, isSection, selected, onSelect }: {
  template: Template
  isSection: boolean
  selected: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: '0.85rem', borderRadius: '10px', cursor: 'pointer',
        border: `1.5px solid ${selected ? T.primaryRing : T.border}`,
        background: selected ? T.primarySoft : T.surface,
        transition: 'all 0.15s',
        position: 'relative',
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute', top: '0.5rem', right: '0.5rem',
          width: 18, height: 18, borderRadius: '50%',
          background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={11} color="#fff" strokeWidth={3} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
        {isSection
          ? LAYOUT_ICONS[template.layout || 'grid']
          : <File size={16} color={T.primary} />}
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: T.ink }}>{template.name}</span>
      </div>
      <div style={{ fontSize: '0.68rem', color: T.muted, marginBottom: '0.4rem', lineHeight: 1.4 }}>
        {template.description}
      </div>
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        {template.section_type && <Badge color="blue">{template.section_type}</Badge>}
        {template.layout && <Badge color="gray">{template.layout}</Badge>}
        {template.contents && <Badge color="gray">{template.contents.length} items</Badge>}
        {template.sections && <Badge color="green">{template.sections.length} sections</Badge>}
      </div>
    </div>
  )
}

/* ─── Preview Item ──────────────────────────────────────── */
function PreviewItem({ title, subtitle, image_url }: { title?: string; subtitle?: string; image_url?: string }) {
  return (
    <div style={{
      display: 'flex', gap: '0.4rem', padding: '0.35rem',
      background: T.bgSubtle, borderRadius: '6px', border: `1px solid ${T.borderLt}`,
    }}>
      {image_url ? (
        <img src={image_url} alt="" style={{ width: 36, height: 36, borderRadius: '5px', objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: 36, height: 36, borderRadius: '5px',
          background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Image size={13} color={T.faint} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: T.ink }}>{title || 'Untitled'}</div>
        {subtitle && <div style={{ fontSize: '0.58rem', color: T.muted, marginTop: '0.1rem' }}>{subtitle}</div>}
      </div>
    </div>
  )
}
