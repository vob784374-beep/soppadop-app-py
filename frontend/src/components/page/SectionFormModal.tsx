import { useState, useEffect } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { theme as T } from '@/styles/theme'
import { Sparkles, ChevronDown, ChevronRight } from '@/components/ui/Icons'
import type { PageSection, SectionEffects } from '@/types'

const SECTION_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'blog', label: 'Blog' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'travel', label: 'Travel' },
  { value: 'review', label: 'Review' },
  { value: 'video', label: 'Video' },
  { value: 'featured', label: 'Featured' },
]

const LAYOUTS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'hero', label: 'Hero' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'card', label: 'Card Deck' },
  { value: 'masonry', label: 'Masonry' },
  { value: 'featured', label: 'Featured' },
  { value: 'split', label: 'Split' },
  { value: 'mosaic', label: 'Mosaic' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'showcase', label: 'Showcase' },
]

const DEFAULT_EFFECTS: SectionEffects = {
  entry_effect: 'none',
  image_effect: 'none',
  text_effect: 'none',
  card_effect: 'none',
  bg_effect: 'none',
  auto_effect: 'none',
}

const EFFECT_OPTIONS = {
  entry: [
    { value: 'none', label: 'None', preview: 'No animation' },
    { value: 'fade-in', label: 'Fade In', preview: 'Opacity 0→1' },
    { value: 'slide-up', label: 'Slide Up', preview: 'Slides up into view' },
    { value: 'slide-left', label: 'Slide Left', preview: 'Slides from left' },
    { value: 'slide-right', label: 'Slide Right', preview: 'Slides from right' },
    { value: 'zoom-in', label: 'Zoom In', preview: 'Scales up into view' },
    { value: 'flip-up', label: 'Flip Up', preview: '3D flip into view' },
    { value: 'bounce-in', label: 'Bounce In', preview: 'Bouncy entrance' },
  ],
  image: [
    { value: 'none', label: 'None', preview: 'Standard image' },
    { value: 'grayscale', label: 'Grayscale→Color', preview: 'B&W, color on hover' },
    { value: 'blur', label: 'Blur→Focus', preview: 'Blur, focus on hover' },
    { value: 'slide-reveal', label: 'Slide Reveal', preview: 'Reveals left to right' },
    { value: 'pulse', label: 'Pulse', preview: 'Gentle breathing zoom' },
    { value: 'tilt', label: '3D Tilt', preview: 'Tilt on hover' },
    { value: 'zoom-hover', label: 'Zoom Hover', preview: 'Zoom on hover' },
    { value: 'kenburns', label: 'Ken Burns', preview: 'Slow cinematic zoom' },
    { value: 'float', label: 'Float', preview: 'Gentle floating motion' },
  ],
  text: [
    { value: 'none', label: 'None', preview: 'Standard text' },
    { value: 'fade-up', label: 'Fade Up', preview: 'Fades up into view' },
    { value: 'gradient', label: 'Gradient Text', preview: 'Colorful gradient' },
    { value: 'animated-gradient', label: 'Animated Gradient', preview: 'Moving gradient colors' },
    { value: 'underline-grow', label: 'Underline Grow', preview: 'Underline grows in' },
    { value: 'highlight-sweep', label: 'Highlight Sweep', preview: 'Highlight sweeps in' },
    { value: 'letter-space', label: 'Letter Space', preview: 'Letters spread then settle' },
    { value: 'typewriter', label: 'Typewriter', preview: 'Types character by character' },
    { value: 'wave-letters', label: 'Wave Letters', preview: 'Each letter waves up-down' },
    { value: 'cursor-blink', label: 'Cursor Blink', preview: 'Typewriter with blinking cursor' },
  ],
  card: [
    { value: 'none', label: 'None', preview: 'No hover effect' },
    { value: 'lift', label: 'Lift', preview: 'Lifts up on hover' },
    { value: 'glow', label: 'Glow', preview: 'Glowing shadow on hover' },
    { value: 'glow-pulse', label: 'Glow Pulse', preview: 'Auto pulsing glow' },
    { value: 'border-pulse', label: 'Border Pulse', preview: 'Pulsing border on hover' },
    { value: 'scale', label: 'Scale Up', preview: 'Grows slightly on hover' },
    { value: 'tilt', label: '3D Tilt', preview: '3D tilt on hover' },
    { value: 'shine', label: 'Shine', preview: 'Light sweep on hover' },
    { value: 'magnetic', label: 'Magnetic', preview: 'Follows cursor magnetically' },
  ],
  bg: [
    { value: 'none', label: 'None', preview: 'Solid background' },
    { value: 'gradient-shift', label: 'Gradient Shift', preview: 'Slow color shift' },
    { value: 'dots', label: 'Dots Pattern', preview: 'Subtle dot grid' },
    { value: 'grid-lines', label: 'Grid Lines', preview: 'Subtle grid lines' },
    { value: 'mesh', label: 'Mesh Gradient', preview: 'Floating mesh blobs' },
    { value: 'orbs', label: 'Floating Orbs', preview: 'Floating color orbs' },
    { value: 'animated-gradient', label: 'Animated Gradient', preview: 'Rainbow gradient' },
    { value: 'wave', label: 'Wave', preview: 'Animated wave bottom' },
    { value: 'ripple', label: 'Ripple', preview: 'Expanding ripple circles' },
  ],
  auto: [
    { value: 'none', label: 'None', preview: 'No auto animation' },
    { value: 'float', label: 'Float', preview: 'Gentle up-down float' },
    { value: 'breathe', label: 'Breathe', preview: 'Slow scale breathing' },
    { value: 'rotate', label: 'Rotate', preview: 'Slow continuous rotation' },
    { value: 'wave', label: 'Wave', preview: 'Wave-like motion' },
    { value: 'swing', label: 'Pendulum', preview: 'Pendulum swing' },
    { value: 'heartbeat', label: 'Heartbeat', preview: 'Heartbeat pulse' },
    { value: 'shake', label: 'Shake', preview: 'Attention shake' },
    { value: 'color-cycle', label: 'Color Cycle', preview: 'Hue rotation cycle' },
    { value: 'marquee', label: 'Marquee', preview: 'Scrolling text marquee' },
  ],
}

interface SectionFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<PageSection>) => Promise<void>
  section?: PageSection | null
}

export default function SectionFormModal({ open, onClose, onSave, section }: SectionFormModalProps) {
  const [form, setForm] = useState<Partial<PageSection>>({})
  const [effects, setEffects] = useState<SectionEffects>(DEFAULT_EFFECTS)
  const [showEffects, setShowEffects] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (section) {
      setForm({
        title: section.title,
        section_type: section.section_type,
        layout: section.layout,
        description: section.description || '',
        cover_image: section.cover_image || '',
        max_items: section.max_items,
        background_color: section.background_color || '',
        is_visible: section.is_visible,
        status: section.status,
      })
      setEffects(section.section_effects || DEFAULT_EFFECTS)
    } else {
      setForm({
        title: '', section_type: 'general', layout: 'grid',
        description: '', cover_image: '', max_items: 6,
        background_color: '', is_visible: true, status: 'draft',
      })
      setEffects(DEFAULT_EFFECTS)
    }
    setShowEffects(false)
  }, [section, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) return
    setSaving(true)
    await onSave({ ...form, section_effects: effects })
    setSaving(false)
  }

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))
  const setEffect = (key: keyof SectionEffects, value: string) => setEffects(prev => ({ ...prev, [key]: value }))

  const hasEffects = Object.values(effects).some(v => v !== 'none')

  return (
    <Modal open={open} onClose={onClose} title={section ? 'Edit Section' : 'New Section'}>
      <form onSubmit={handleSubmit}>
        <Input label="Title" value={form.title || ''} onChange={e => set('title', e.target.value)} required />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <FieldSelect label="Type" value={form.section_type || 'general'} onChange={v => set('section_type', v)} options={SECTION_TYPES} />
          <FieldSelect label="Layout" value={form.layout || 'grid'} onChange={v => set('layout', v)} options={LAYOUTS} />
        </div>

        <FieldTextarea label="Description" value={form.description || ''} onChange={v => set('description', v)} />
        <Input label="Cover Image URL" value={form.cover_image || ''} onChange={e => set('cover_image', e.target.value)} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <Input label="Max Items" type="number" value={form.max_items || 6} onChange={e => set('max_items', parseInt(e.target.value))} />
          <Input label="Background Color" value={form.background_color || ''} onChange={e => set('background_color', e.target.value)} placeholder="#f5f5f5" />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: T.inkSoft, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_visible ?? true} onChange={e => set('is_visible', e.target.checked)} />
            Visible
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: T.inkSoft, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.status === 'published'} onChange={e => set('status', e.target.checked ? 'published' : 'draft')} />
            Published
          </label>
        </div>

        {/* Effects Section */}
        <div style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setShowEffects(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 0.7rem', borderRadius: '8px',
              border: `1px solid ${hasEffects ? T.primaryRing : T.border}`,
              background: hasEffects ? T.primarySoft : T.bgSubtle,
              cursor: 'pointer', width: '100%',
              color: hasEffects ? T.primary : T.inkSoft,
              fontSize: '0.78rem', fontWeight: 600,
            }}
          >
            <Sparkles size={14} />
            Visual Effects
            {hasEffects && (
              <span style={{
                marginLeft: 'auto', fontSize: '0.6rem', padding: '0.08rem 0.35rem',
                borderRadius: 4, background: T.primary, color: '#fff',
                fontWeight: 700,
              }}>
                {Object.values(effects).filter(v => v !== 'none').length} active
              </span>
            )}
            <span style={{ marginLeft: 'auto' }}>
              {showEffects ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </button>

          {showEffects && (
            <div style={{
              marginTop: '0.5rem', padding: '0.75rem',
              background: T.bgSubtle, borderRadius: '8px',
              border: `1px solid ${T.border}`,
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
            }}>
              <EffectPicker
                label="Section Entry"
                icon="🎬"
                value={effects.entry_effect}
                onChange={v => setEffect('entry_effect', v)}
                options={EFFECT_OPTIONS.entry}
              />
              <EffectPicker
                label="Image Style"
                icon="🖼️"
                value={effects.image_effect}
                onChange={v => setEffect('image_effect', v)}
                options={EFFECT_OPTIONS.image}
              />
              <EffectPicker
                label="Text Effect"
                icon="✏️"
                value={effects.text_effect}
                onChange={v => setEffect('text_effect', v)}
                options={EFFECT_OPTIONS.text}
              />
              <EffectPicker
                label="Card Hover"
                icon="🃏"
                value={effects.card_effect}
                onChange={v => setEffect('card_effect', v)}
                options={EFFECT_OPTIONS.card}
              />
              <EffectPicker
                label="Background"
                icon="🎨"
                value={effects.bg_effect}
                onChange={v => setEffect('bg_effect', v)}
                options={EFFECT_OPTIONS.bg}
              />
              <EffectPicker
                label="Auto Motion"
                icon="⚡"
                value={effects.auto_effect}
                onChange={v => setEffect('auto_effect', v)}
                options={EFFECT_OPTIONS.auto}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
          <Button size="sm" loading={saving} type="submit">{section ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}

/* ─── Effect Picker ──────────────────────────────────────── */
function EffectPicker({ label, icon, value, onChange, options }: {
  label: string; icon: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; preview: string }[]
}) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.3rem',
        marginBottom: '0.35rem', fontSize: '0.72rem', fontWeight: 600, color: T.inkSoft,
      }}>
        <span>{icon}</span>
        {label}
      </div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.25rem',
      }}>
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            title={opt.preview}
            style={{
              padding: '0.3rem 0.6rem', borderRadius: '6px',
              border: `1px solid ${value === opt.value ? T.primaryRing : T.border}`,
              background: value === opt.value ? T.primarySoft : '#fff',
              color: value === opt.value ? T.primary : T.inkSoft,
              fontSize: '0.68rem', fontWeight: value === opt.value ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Field Components ───────────────────────────────────── */
function FieldTextarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: T.inkSoft, marginBottom: '0.2rem' }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} style={{
        width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px',
        border: `1px solid ${T.border}`, fontSize: '0.78rem', resize: 'vertical',
        fontFamily: 'inherit', color: T.ink,
      }} />
    </div>
  )
}

function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: T.inkSoft, marginBottom: '0.2rem' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px',
        border: `1px solid ${T.border}`, fontSize: '0.78rem', color: T.ink, background: '#fff',
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
