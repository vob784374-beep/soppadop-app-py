import { useState, useEffect } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { theme as T } from '@/styles/theme'
import { Plus, Trash } from '@/components/ui/Icons'
import type { SectionContent } from '@/types'

interface ContentFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<SectionContent> & { section_id?: number }) => Promise<void>
  content?: SectionContent | null
  sectionId: number
}

function splitUrls(raw: string | null): string[] {
  if (!raw) return ['']
  return raw.split('\n').filter(Boolean)
}

function joinUrls(urls: string[]): string {
  return urls.filter(u => u.trim()).join('\n')
}

export default function ContentFormModal({ open, onClose, onSave, content, sectionId }: ContentFormModalProps) {
  const [form, setForm] = useState<Record<string, any>>({})
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [videoUrls, setVideoUrls] = useState<string[]>([''])
  const [linkUrls, setLinkUrls] = useState<string[]>([''])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (content) {
      setForm({
        title: content.title || '',
        subtitle: content.subtitle || '',
        body: content.body || '',
        tags: content.tags || '',
        author: content.author || '',
        content_date: content.content_date?.slice(0, 10) || '',
        is_visible: content.is_visible,
      })
      setImageUrls(splitUrls(content.image_url))
      setVideoUrls(splitUrls(content.video_url))
      setLinkUrls(splitUrls(content.link_url))
    } else {
      setForm({
        title: '', subtitle: '', body: '',
        tags: '', author: '', content_date: '', is_visible: true,
      })
      setImageUrls([''])
      setVideoUrls([''])
      setLinkUrls([''])
    }
  }, [content, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({
      ...form,
      image_url: joinUrls(imageUrls),
      video_url: joinUrls(videoUrls),
      link_url: joinUrls(linkUrls),
      section_id: sectionId,
    })
    setSaving(false)
  }

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title={content ? 'Edit Content' : 'New Content'}>
      <form onSubmit={handleSubmit} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.3rem' }}>
        <Input label="Title" value={form.title || ''} onChange={e => set('title', e.target.value)} />
        <Input label="Subtitle" value={form.subtitle || ''} onChange={e => set('subtitle', e.target.value)} />
        <FieldTextarea label="Body" value={form.body || ''} onChange={v => set('body', v)} />

        {/* Image URLs */}
        <MultiUrlField label="Image URL" values={imageUrls} onChange={setImageUrls} placeholder="https://..." />

        {/* Video URLs */}
        <MultiUrlField label="Video URL" values={videoUrls} onChange={setVideoUrls} placeholder="https://..." />

        {/* Link URLs */}
        <MultiUrlField label="Link URL" values={linkUrls} onChange={setLinkUrls} placeholder="https://..." />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <Input label="Tags" value={form.tags || ''} onChange={e => set('tags', e.target.value)} placeholder="tag1, tag2" />
          <Input label="Author" value={form.author || ''} onChange={e => set('author', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <Input label="Content Date" type="date" value={form.content_date || ''} onChange={e => set('content_date', e.target.value)} />
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.3rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: T.inkSoft, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_visible ?? true} onChange={e => set('is_visible', e.target.checked)} />
              Visible
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
          <Button size="sm" loading={saving} type="submit">{content ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}

/* ─── Multi URL Field ───────────────────────────────────── */
function MultiUrlField({ label, values, onChange, placeholder }: {
  label: string
  values: string[]
  onChange: (urls: string[]) => void
  placeholder?: string
}) {
  const update = (i: number, val: string) => {
    const next = [...values]
    next[i] = val
    onChange(next)
  }

  const add = () => onChange([...values, ''])

  const remove = (i: number) => {
    if (values.length <= 1) {
      onChange([''])
      return
    }
    onChange(values.filter((_, idx) => idx !== i))
  }

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <label style={{
        display: 'block', fontSize: '0.72rem', fontWeight: 600,
        color: T.inkSoft, marginBottom: '0.25rem',
      }}>{label}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {values.map((val, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
            <input
              value={val}
              onChange={e => update(i, e.target.value)}
              placeholder={placeholder}
              style={{
                flex: 1, height: '32px', padding: '0 0.5rem',
                borderRadius: '6px', border: `1px solid ${T.border}`,
                fontSize: '0.75rem', color: T.ink, fontFamily: 'inherit',
              }}
            />
            {values.length > 1 && (
              <button type="button" onClick={() => remove(i)} style={{
                width: 28, height: 28, borderRadius: '6px',
                border: `1px solid ${T.borderLt}`, background: T.bgSubtle,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: T.rose, flexShrink: 0,
              }}>
                <Trash size={12} />
              </button>
            )}
            {i === values.length - 1 && (
              <button type="button" onClick={add} style={{
                width: 28, height: 28, borderRadius: '6px',
                border: `1px solid ${T.primaryRing}`, background: T.primarySoft,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: T.primary, flexShrink: 0,
              }}>
                <Plus size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Textarea ──────────────────────────────────────────── */
function FieldTextarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: T.inkSoft, marginBottom: '0.25rem' }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={{
        width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px',
        border: `1px solid ${T.border}`, fontSize: '0.78rem', resize: 'vertical',
        fontFamily: 'inherit', color: T.ink,
      }} />
    </div>
  )
}
