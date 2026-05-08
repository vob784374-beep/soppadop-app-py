import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, Badge } from '@/components/ui'
import { theme as T } from '@/styles/theme'
import { Grid, List, Play, Star, Plus, Layout, File, Check } from '@/components/ui/Icons'
import type { Template, TemplateData } from '@/types'

const LAYOUT_ICONS: Record<string, React.ReactNode> = {
  grid: <Grid size={16} color={T.primary} />,
  list: <List size={16} color={T.accent} />,
  hero: <Star size={16} color={T.amber} />,
  carousel: <Play size={16} color={T.rose} />,
  card: <Layout size={16} color={T.primary} />,
  masonry: <Grid size={16} color="#8b5cf6" />,
  featured: <Star size={16} color="#f59e0b" />,
  split: <Layout size={16} color="#10b981" />,
  mosaic: <Grid size={16} color="#ec4899" />,
  timeline: <List size={16} color="#6366f1" />,
  pricing: <File size={16} color="#0ea5e9" />,
  testimonial: <Star size={16} color="#f97316" />,
  showcase: <Play size={16} color="#14b8a6" />,
}

interface TemplateModalProps {
  open: boolean
  onClose: () => void
  templates: TemplateData
  appliedTemplates: string[]
  onApplySection: (templateId: string) => Promise<void>
  onApplyPage: (templateId: string) => Promise<void>
  onAttachToSection: (templateId: string) => Promise<void>
  selectedSectionTitle: string | null
}

export default function TemplateModal({
  open, onClose, templates, appliedTemplates,
  onApplySection, onApplyPage, onAttachToSection,
  selectedSectionTitle,
}: TemplateModalProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'section' | 'page'>('section')
  const [selected, setSelected] = useState<Template | null>(null)
  const [applying, setApplying] = useState(false)

  const list = tab === 'section' ? templates.section_templates : templates.page_templates

  const isApplied = (templateId: string) => appliedTemplates.includes(templateId)
  const selectedIsApplied = tab === 'page' && selected ? isApplied(selected.id) : false

  const handleApply = async () => {
    if (!selected || selectedIsApplied) return
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
      onClose()
    } finally {
      setApplying(false)
    }
  }

  const handleClose = () => {
    setSelected(null)
    setTab('section')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title={t('pageAdmin.fromTemplate', 'Create from Template')}>
      {/* Sub-tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem', marginBottom: '1rem',
        background: T.bgSubtle, borderRadius: '10px', padding: '0.25rem',
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
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', color: T.muted }}>
          {t('pageAdmin.attachTemplateHint', 'Add content to:')}{' '}
          <strong style={{ color: T.primary }}>{selectedSectionTitle}</strong>
        </p>
      )}
      {tab === 'section' && !selectedSectionTitle && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', color: T.muted }}>
          {t('pageAdmin.sectionTemplateHint', 'Create a new section from a template.')}
        </p>
      )}
      {tab === 'page' && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', color: T.muted }}>
          {t('pageAdmin.pageTemplateHint', 'Create a full page with multiple sections at once.')}
          {' '}
          <span style={{ color: T.roseText, fontWeight: 600 }}>
            {t('pageAdmin.pageTemplateOnce', 'Each template can only be applied once.')}
          </span>
        </p>
      )}

      {/* Template Grid */}
      <div style={{
        background: T.bgSubtle, borderRadius: '10px',
        border: `1px solid ${T.border}`, padding: '0.75rem',
        maxHeight: '360px', overflowY: 'auto',
      }}>
        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <File size={32} color={T.faint} />
            <p style={{ color: T.faint, fontSize: '0.8rem', marginTop: '0.75rem' }}>
              {t('pageAdmin.noTemplates', 'No templates available')}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '0.6rem',
          }}>
            {list.map(tmpl => (
              <TemplateCard
                key={tmpl.id}
                template={tmpl}
                isSection={tab === 'section'}
                selected={selected?.id === tmpl.id}
                alreadyApplied={tab === 'page' && isApplied(tmpl.id)}
                onSelect={() => setSelected(tmpl)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected Preview */}
      {selected && (
        <div style={{
          marginTop: '0.75rem', padding: '0.75rem',
          background: selectedIsApplied ? T.amberSoft : T.primarySoft,
          borderRadius: '8px',
          border: `1px solid ${selectedIsApplied ? T.amberRing : T.primaryRing}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            {tab === 'section'
              ? LAYOUT_ICONS[selected.layout || 'grid']
              : <File size={14} color={T.primary} />}
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: T.ink }}>{selected.name}</span>
            {selectedIsApplied && (
              <Badge color="orange">{t('pageAdmin.alreadyApplied', 'Already Applied')}</Badge>
            )}
          </div>
          <p style={{ fontSize: '0.7rem', color: T.muted, margin: 0, lineHeight: 1.4 }}>
            {selected.description}
          </p>
          <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            {selected.contents && <Badge color="gray">{selected.contents.length} items</Badge>}
            {selected.sections && <Badge color="green">{selected.sections.length} sections</Badge>}
            {selected.layout && <Badge color="gray">{selected.layout}</Badge>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          size="sm"
          loading={applying}
          disabled={!selected || selectedIsApplied}
          onClick={handleApply}
          title={selectedIsApplied ? t('pageAdmin.templateAlreadyApplied', 'This template has already been applied') : undefined}
        >
          <Plus size={13} />{' '}
          {tab === 'page'
            ? selectedIsApplied
              ? t('pageAdmin.alreadyApplied', 'Already Applied')
              : t('pageAdmin.createPage', 'Create Page')
            : selectedSectionTitle
              ? t('pageAdmin.addToSection', 'Add to Section')
              : t('pageAdmin.createSection', 'Create Section')}
        </Button>
      </div>
    </Modal>
  )
}

function SubTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '0.45rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
      background: active ? '#fff' : 'transparent',
      color: active ? T.ink : T.muted, fontWeight: 600, fontSize: '0.75rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
      boxShadow: active ? T.shadowSm : 'none',
      transition: 'all 0.15s',
    }}>{children}</button>
  )
}

function TemplateCard({ template, isSection, selected, alreadyApplied, onSelect }: {
  template: Template
  isSection: boolean
  selected: boolean
  alreadyApplied: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={alreadyApplied ? undefined : onSelect}
      style={{
        padding: '0.75rem', borderRadius: '10px',
        cursor: alreadyApplied ? 'not-allowed' : 'pointer',
        border: `1.5px solid ${selected ? T.primaryRing : alreadyApplied ? T.amberRing : T.border}`,
        background: selected ? T.primarySoft : alreadyApplied ? T.amberSoft : '#fff',
        transition: 'all 0.15s',
        position: 'relative',
        opacity: alreadyApplied ? 0.7 : 1,
      }}
    >
      {selected && !alreadyApplied && (
        <div style={{
          position: 'absolute', top: '0.5rem', right: '0.5rem',
          width: 18, height: 18, borderRadius: '50%',
          background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={11} color="#fff" strokeWidth={3} />
        </div>
      )}
      {alreadyApplied && (
        <div style={{
          position: 'absolute', top: '0.5rem', right: '0.5rem',
          padding: '0.1rem 0.4rem', borderRadius: 4,
          background: T.amber, color: '#fff',
          fontSize: '0.55rem', fontWeight: 700,
        }}>
          Applied
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
        {isSection
          ? LAYOUT_ICONS[template.layout || 'grid']
          : <File size={16} color={T.primary} />}
        <span style={{
          fontSize: '0.75rem', fontWeight: 700,
          color: alreadyApplied ? T.muted : T.ink,
        }}>{template.name}</span>
      </div>
      <div style={{ fontSize: '0.65rem', color: T.muted, marginBottom: '0.35rem', lineHeight: 1.4 }}>
        {template.description}
      </div>
      <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
        {template.section_type && <Badge color="blue">{template.section_type}</Badge>}
        {template.layout && <Badge color="gray">{template.layout}</Badge>}
        {template.contents && <Badge color="gray">{template.contents.length} items</Badge>}
        {template.sections && <Badge color="green">{template.sections.length} sections</Badge>}
      </div>
    </div>
  )
}
