import { useState, useEffect, useRef } from 'react'
import { publicPageService } from '@/services'
import type { PageSection, SectionContent, SectionEffects } from '@/types'
import { Spinner } from '@/components/ui'
import { theme as T } from '@/styles/theme'

/* ─── Scroll Reveal Hook ────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect() } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, revealed }
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function PublicPage() {
  const [sections, setSections] = useState<PageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeNav, setActiveNav] = useState<string>('')

  useEffect(() => {
    publicPageService.getPage()
      .then(data => setSections(data))
      .catch(err => setError(err?.response?.data?.error || 'Failed to load page'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      for (const s of sections.filter(s => s.is_visible)) {
        const el = document.getElementById(`section-${s.id}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120 && rect.bottom > 120) {
            setActiveNav(`section-${s.id}`)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  useEffect(() => {
    if (loading || sections.length === 0) return
    const hash = window.location.hash
    if (hash && hash.startsWith('#section-')) {
      const id = hash.slice(1)
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          setActiveNav(id)
        }
      }, 300)
    }
  }, [loading, sections])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: T.bg }}>
      <Spinner />
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem', fontFamily: "'Inter', sans-serif", color: T.roseText }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠</div>
      <h2>{error}</h2>
    </div>
  )

  const visible = sections.filter(s => s.is_visible)

  return (
    <div style={{
      minHeight: '100vh', background: T.bg,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", color: T.ink,
    }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px) saturate(1.8)',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.6rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div style={{
              width: 26, height: 26, background: T.gradPrimary,
              borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: '0.72rem',
              boxShadow: '0 2px 6px rgba(99,102,241,0.25)',
            }}>S</div>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: T.ink, letterSpacing: '-0.02em' }}>Soppadop</span>
          </div>
          <div style={{ display: 'flex', gap: '0.2rem' }}>
            {visible.map(s => (
              <a key={s.id} href={`#section-${s.id}`} onClick={() => setActiveNav(`section-${s.id}`)} style={{
                fontSize: '0.7rem', color: activeNav === `section-${s.id}` ? T.primary : T.muted,
                textDecoration: 'none', fontWeight: activeNav === `section-${s.id}` ? 600 : 500,
                padding: '0.25rem 0.6rem', borderRadius: '6px',
                background: activeNav === `section-${s.id}` ? T.primarySoft : 'transparent',
                transition: 'all 0.2s',
              }}>{s.title}</a>
            ))}
          </div>
        </div>
      </nav>

      {visible.length === 0 ? <EmptyState /> : visible.map((s, i) => <SectionBlock key={s.id} section={s} index={i} />)}

      {/* Footer */}
      <footer style={{ background: T.dark, color: T.darkMuted, padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.6rem' }}>
                <div style={{ width: 24, height: 24, background: T.gradPrimary, borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '0.68rem' }}>S</div>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Soppadop</span>
              </div>
              <p style={{ fontSize: '0.75rem', lineHeight: 1.7, maxWidth: '260px', opacity: 0.7 }}>
                A creative platform for content management, resources, and digital storytelling.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem', fontFamily: "'JetBrains Mono', monospace" }}>Quick Links</h4>
              {visible.slice(0, 5).map(s => (
                <a key={s.id} href={`#section-${s.id}`} style={{ display: 'block', color: T.darkMuted, fontSize: '0.75rem', textDecoration: 'none', marginBottom: '0.35rem' }}>{s.title}</a>
              ))}
            </div>
            <div>
              <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem', fontFamily: "'JetBrains Mono', monospace" }}>Connect</h4>
              <p style={{ fontSize: '0.75rem', lineHeight: 1.7, opacity: 0.7 }}>Stay updated with our latest content and features.</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontFamily: "'JetBrains Mono', monospace", opacity: 0.5 }}>
            <span>&copy; {new Date().getFullYear()} Soppadop. All rights reserved.</span>
            <span>Built with care</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─── Empty ──────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '8rem 2rem', maxWidth: '460px', margin: '0 auto' }}>
      <div style={{ width: 72, height: 72, borderRadius: '18px', background: T.bgSubtle, margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={T.faint} strokeWidth="1.5">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: T.ink, marginBottom: '0.4rem' }}>No content yet</h2>
      <p style={{ color: T.muted, fontSize: '0.85rem', lineHeight: 1.6 }}>Page content will appear here once configured.</p>
    </div>
  )
}

/* ─── Section Block with Effects ─────────────────────────── */
function SectionBlock({ section, index }: { section: PageSection; index: number }) {
  const { ref, revealed } = useScrollReveal()
  const effects = section.section_effects
  const bg = section.background_color || (index % 2 === 0 ? '#ffffff' : T.bgSubtle)
  const contents = section.contents || []

  const entryEffect = effects?.entry_effect || 'none'
  const bgEffect = effects?.bg_effect || 'none'
  const autoEffect = effects?.auto_effect || 'none'

  const bgClasses = [
    bgEffect === 'gradient-shift' ? 'bg-effect-gradient-shift' : '',
    bgEffect === 'dots' ? 'bg-effect-dots' : '',
    bgEffect === 'grid-lines' ? 'bg-effect-grid-lines' : '',
    bgEffect === 'mesh' ? 'bg-effect-mesh' : '',
    bgEffect === 'orbs' ? 'bg-effect-orbs' : '',
    bgEffect === 'animated-gradient' ? 'bg-effect-animated-gradient' : '',
    bgEffect === 'wave' ? 'bg-effect-wave' : '',
    bgEffect === 'ripple' ? 'auto-ripple-bg' : '',
  ].filter(Boolean).join(' ')

  const autoClass = autoEffect !== 'none' ? `auto-${autoEffect}` : ''

  return (
    <section
      ref={ref}
      id={`section-${section.id}`}
      className={`section-reveal ${revealed ? 'revealed' : ''} ${bgClasses} ${autoClass}`.trim()}
      data-entry={entryEffect !== 'none' ? entryEffect : undefined}
      style={{
        padding: '3.5rem 2rem', background: bg,
        borderTop: index > 0 ? `1px solid ${T.border}` : 'none',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <SectionHeader section={section} index={index} effects={effects} />

        {section.layout === 'grid' && <GridLayout contents={contents} max={section.max_items} effects={effects} />}
        {section.layout === 'list' && <ListLayout contents={contents} max={section.max_items} effects={effects} />}
        {section.layout === 'hero' && contents.length > 0 && <HeroLayout content={contents[0]} effects={effects} />}
        {section.layout === 'carousel' && <CarouselLayout contents={contents} max={section.max_items} />}
        {section.layout === 'card' && <CardDeckLayout contents={contents} max={section.max_items} effects={effects} />}
        {section.layout === 'masonry' && <MasonryLayout contents={contents} max={section.max_items} effects={effects} />}
        {section.layout === 'featured' && <FeaturedLayout contents={contents} max={section.max_items} effects={effects} />}
        {section.layout === 'split' && <SplitLayout contents={contents} max={section.max_items} effects={effects} />}
        {section.layout === 'mosaic' && <MosaicLayout contents={contents} max={section.max_items} effects={effects} />}
        {section.layout === 'timeline' && <TimelineLayout contents={contents} max={section.max_items} effects={effects} />}
        {section.layout === 'pricing' && <PricingLayout contents={contents} max={section.max_items} effects={effects} />}
        {section.layout === 'testimonial' && <TestimonialLayout contents={contents} max={section.max_items} effects={effects} />}
        {section.layout === 'showcase' && <ShowcaseLayout contents={contents} max={section.max_items} effects={effects} />}
      </div>
    </section>
  )
}

/* ─── Section Header with Text Effect ────────────────────── */
function SectionHeader({ section, index, effects }: { section: PageSection; index: number; effects: SectionEffects | null }) {
  const textEffect = effects?.text_effect || 'none'
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const titleClass = textEffect === 'gradient' ? 'text-effect-gradient'
    : textEffect === 'animated-gradient' ? 'text-effect-animated-gradient'
    : textEffect === 'underline-grow' ? `text-effect-underline-grow ${active ? 'active' : ''}`
    : textEffect === 'highlight-sweep' ? `text-effect-highlight-sweep ${active ? 'active' : ''}`
    : textEffect === 'letter-space' && active ? 'text-effect-letter-space'
    : textEffect === 'typewriter' ? `text-effect-typewriter ${active ? 'active' : ''}`
    : textEffect === 'cursor-blink' ? 'auto-cursor-blink'
    : textEffect === 'wave-letters' ? 'text-effect-wave-letters'
    : textEffect === 'fade-up' && active ? 'text-effect-fade-up'
    : ''

  const titleContent = textEffect === 'wave-letters' && section.title
    ? section.title.split('').map((ch, i) => <span key={i}>{ch === ' ' ? '\u00A0' : ch}</span>)
    : section.title

  return (
    <div ref={ref} style={{
      textAlign: index % 2 === 0 ? 'center' : 'left',
      marginBottom: '2rem',
      maxWidth: index % 2 === 0 ? '560px' : 'none',
      margin: index % 2 === 0 ? '0 auto 2rem' : '0 0 2rem',
    }}>
      <span style={{
        display: 'inline-block', fontSize: '0.54rem', textTransform: 'uppercase', letterSpacing: '0.14em',
        color: T.primaryText, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
        marginBottom: '0.4rem', background: T.primarySoft, padding: '0.12rem 0.5rem', borderRadius: '3px',
        border: `1px solid ${T.primaryRing}`,
      }}>{section.section_type}</span>
      <h2 className={titleClass} style={{
        fontSize: '1.6rem', fontWeight: 800, color: T.ink,
        letterSpacing: '-0.02em', marginBottom: '0.4rem', lineHeight: 1.2,
      }}>{titleContent}</h2>
      {section.description && <p style={{
        color: T.muted, fontSize: '0.88rem', lineHeight: 1.7,
        maxWidth: '520px', margin: index % 2 === 0 ? '0 auto' : 0,
      }}>{section.description}</p>}
    </div>
  )
}

/* ─── Grid ───────────────────────────────────────────────── */
function GridLayout({ contents, max, effects }: { contents: SectionContent[]; max: number; effects: SectionEffects | null }) {
  return (
    <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      {contents.slice(0, max).map((c, i) => (
        <div key={c.id} className="stagger-child" style={{ animationDelay: `${i * 0.1}s` }}>
          <GridCard content={c} effects={effects} />
        </div>
      ))}
    </div>
  )
}

function GridCard({ content, effects }: { content: SectionContent; effects: SectionEffects | null }) {
  const [h, setH] = useState(false)
  const imageEffect = effects?.image_effect || 'none'
  const cardEffect = effects?.card_effect || 'none'

  const cardClass = cardEffect !== 'none' ? `card-effect-${cardEffect}` : ''
  const imageClass = [
    imageEffect !== 'none' && imageEffect !== 'kenburns' && imageEffect !== 'float' ? `image-effect-${imageEffect}` : '',
    imageEffect === 'kenburns' ? 'image-effect-kenburns' : '',
    imageEffect === 'float' ? 'image-effect-float' : '',
  ].filter(Boolean).join(' ')

  return (
    <article
      className={cardClass}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: T.surface, borderRadius: '12px', overflow: 'hidden',
        border: `1px solid ${T.border}`,
        ...(cardEffect === 'none' ? {
          transition: 'transform 0.25s, box-shadow 0.25s',
          transform: h ? 'translateY(-3px)' : 'none',
          boxShadow: h ? T.shadowLg : T.shadowSm,
        } : {}),
      }}
    >
      {content.image_url && (
        <div className={imageClass} style={{ height: '190px', overflow: 'hidden', position: 'relative' }}>
          <img src={content.image_url} alt={content.title || ''} style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: imageEffect === 'zoom-hover' ? 'transform 0.4s' : undefined,
            transform: imageEffect === 'zoom-hover' && h ? 'scale(1.08)' : imageEffect === 'zoom-hover' ? 'scale(1)' : undefined,
          }} />
          {content.content_date && <span style={{ position: 'absolute', bottom: '0.65rem', left: '0.65rem', background: 'rgba(0,0,0,0.55)', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '0.58rem', fontFamily: "'JetBrains Mono', monospace" }}>{content.content_date.slice(0, 10)}</span>}
        </div>
      )}
      <div style={{ padding: '1.1rem' }}>
        {content.tags && <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.55rem' }}>
          {content.tags.split(',').map((tag, i) => <span key={i} style={{ fontSize: '0.56rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: T.primarySoft, color: T.primaryText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: "'JetBrains Mono', monospace" }}>{tag.trim()}</span>)}
        </div>}
        {content.title && <h3 style={{ fontSize: '1rem', fontWeight: 700, color: T.ink, marginBottom: '0.3rem', lineHeight: 1.35 }}>{content.title}</h3>}
        {content.subtitle && <p style={{ fontSize: '0.78rem', color: T.muted, marginBottom: '0.3rem' }}>{content.subtitle}</p>}
        {content.body && <p style={{ fontSize: '0.78rem', color: T.inkSoft, lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{content.body}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: `1px solid ${T.borderLt}` }}>
          {content.author && <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: T.gradCool, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.48rem', fontWeight: 700 }}>{content.author.charAt(0).toUpperCase()}</div>
            <span style={{ fontSize: '0.66rem', color: T.faint, fontWeight: 500 }}>{content.author}</span>
          </div>}
          {content.link_url && <a href={content.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.68rem', color: T.primary, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.15rem' }}>Read more →</a>}
        </div>
      </div>
    </article>
  )
}

/* ─── List ───────────────────────────────────────────────── */
function ListLayout({ contents, max, effects }: { contents: SectionContent[]; max: number; effects: SectionEffects | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {contents.slice(0, max).map((c, i) => (
        <div key={c.id} className="stagger-child" style={{ animationDelay: `${i * 0.1}s` }}>
          <ListCard content={c} effects={effects} />
        </div>
      ))}
    </div>
  )
}

function ListCard({ content, effects }: { content: SectionContent; effects: SectionEffects | null }) {
  const [h, setH] = useState(false)
  const imageEffect = effects?.image_effect || 'none'
  const cardEffect = effects?.card_effect || 'none'

  const cardClass = cardEffect !== 'none' ? `card-effect-${cardEffect}` : ''
  const imageClass = [
    imageEffect !== 'none' && imageEffect !== 'kenburns' && imageEffect !== 'float' ? `image-effect-${imageEffect}` : '',
    imageEffect === 'kenburns' ? 'image-effect-kenburns' : '',
    imageEffect === 'float' ? 'image-effect-float' : '',
  ].filter(Boolean).join(' ')

  return (
    <article
      className={cardClass}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', gap: '1.25rem', background: T.surface, borderRadius: '12px',
        padding: '1.1rem', border: `1px solid ${h ? T.borderDk : T.border}`,
        ...(cardEffect === 'none' ? {
          transition: 'box-shadow 0.2s, border-color 0.2s',
          boxShadow: h ? T.shadowMd : T.shadowSm,
        } : {}),
      }}
    >
      {content.image_url && (
        <div className={imageClass} style={{ width: '180px', minHeight: '130px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          <img src={content.image_url} alt={content.title || ''} style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: imageEffect === 'zoom-hover' ? 'transform 0.4s' : undefined,
            transform: imageEffect === 'zoom-hover' && h ? 'scale(1.08)' : undefined,
          }} />
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {content.tags && <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
          {content.tags.split(',').map((tag, i) => <span key={i} style={{ fontSize: '0.54rem', padding: '0.08rem 0.35rem', borderRadius: '3px', background: T.tealSoft, color: T.tealText, fontWeight: 600, textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>{tag.trim()}</span>)}
        </div>}
        {content.title && <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: T.ink, marginBottom: '0.3rem', lineHeight: 1.3 }}>{content.title}</h3>}
        {content.body && <p style={{ fontSize: '0.78rem', color: T.inkSoft, lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{content.body}</p>}
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', marginTop: '0.6rem' }}>
          {content.author && <span style={{ fontSize: '0.66rem', color: T.faint, fontWeight: 500 }}>By {content.author}</span>}
          {content.link_url && <a href={content.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.68rem', color: T.primary, textDecoration: 'none', fontWeight: 600 }}>Read more →</a>}
        </div>
      </div>
    </article>
  )
}

/* ─── Hero ───────────────────────────────────────────────── */
function HeroLayout({ content, effects }: { content: SectionContent; effects: SectionEffects | null }) {
  const imageEffect = effects?.image_effect || 'none'
  const imageClass = [
    imageEffect !== 'none' && imageEffect !== 'kenburns' && imageEffect !== 'float' ? `image-effect-${imageEffect}` : '',
    imageEffect === 'kenburns' ? 'image-effect-kenburns' : '',
    imageEffect === 'float' ? 'image-effect-float' : '',
  ].filter(Boolean).join(' ')

  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 400px' }}>
        {content.tags && <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.85rem' }}>
          {content.tags.split(',').map((tag, i) => <span key={i} style={{ fontSize: '0.58rem', padding: '0.12rem 0.5rem', borderRadius: '3px', background: T.amberSoft, color: T.amberText, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'JetBrains Mono', monospace" }}>{tag.trim()}</span>)}
        </div>}
        {content.title && <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: T.ink, lineHeight: 1.12, marginBottom: '0.85rem', letterSpacing: '-0.03em' }}>{content.title}</h2>}
        {content.subtitle && <p style={{ fontSize: '1.05rem', color: T.muted, marginBottom: '0.65rem', lineHeight: 1.5 }}>{content.subtitle}</p>}
        {content.body && <p style={{ fontSize: '0.92rem', color: T.inkSoft, lineHeight: 1.8, marginBottom: '1.25rem' }}>{content.body}</p>}
        {content.link_url && <a href={content.link_url} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          padding: '0.65rem 1.6rem', borderRadius: '8px',
          background: T.gradPrimary, color: '#fff', textDecoration: 'none',
          fontWeight: 600, fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
        }}>Explore Now →</a>}
      </div>
      {(content.image_url || content.video_url) && (
        <div className={imageClass} style={{ flex: '1 1 360px', borderRadius: '14px', overflow: 'hidden', boxShadow: T.shadowXl }}>
          {content.image_url && <img src={content.image_url} alt={content.title || ''} style={{ width: '100%', height: '360px', objectFit: 'cover' }} />}
          {content.video_url && !content.image_url && <video src={content.video_url} controls style={{ width: '100%', height: '360px', objectFit: 'cover' }} />}
        </div>
      )}
    </div>
  )
}

/* ─── Carousel ───────────────────────────────────────────── */
function CarouselLayout({ contents, max }: { contents: SectionContent[]; max: number }) {
  const [index, setIndex] = useState(0)
  const items = contents.slice(0, max)

  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(() => setIndex(i => (i + 1) % items.length), 5000)
    return () => clearInterval(timer)
  }, [items.length])

  if (items.length === 0) return null
  const current = items[index]

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ borderRadius: '14px', overflow: 'hidden', minHeight: '360px', background: T.dark, position: 'relative' }}>
        {current.image_url && <img src={current.image_url} alt={current.title || ''} style={{ width: '100%', height: '400px', objectFit: 'cover', opacity: 0.55 }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 35%, rgba(28,25,23,0.88))', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2.25rem', color: '#fff' }}>
          {current.tags && <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.6rem' }}>
            {current.tags.split(',').map((tag, i) => <span key={i} style={{ fontSize: '0.54rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: 'rgba(255,255,255,0.12)', fontWeight: 600, textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>{tag.trim()}</span>)}
          </div>}
          {current.title && <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>{current.title}</h3>}
          {current.subtitle && <p style={{ fontSize: '0.85rem', opacity: 0.75 }}>{current.subtitle}</p>}
        </div>
      </div>
      {items.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginTop: '0.85rem' }}>
          {items.map((_, i) => <button key={i} onClick={() => setIndex(i)} style={{
            width: i === index ? '20px' : '7px', height: '7px', borderRadius: '4px',
            border: 'none', cursor: 'pointer',
            background: i === index ? T.primary : T.border,
            transition: 'all 0.3s ease',
          }} />)}
        </div>
      )}
    </div>
  )
}

/* ─── Card Deck ──────────────────────────────────────────── */
function CardDeckLayout({ contents, max, effects }: { contents: SectionContent[]; max: number; effects: SectionEffects | null }) {
  const items = contents.slice(0, max)
  const imageEffect = effects?.image_effect || 'none'
  const cardEffect = effects?.card_effect || 'none'
  const cardClass = cardEffect !== 'none' ? `card-effect-${cardEffect}` : ''

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`, gap: '1.25rem' }}>
      {items.map((c, i) => (
        <div key={c.id} className="stagger-child" style={{ animationDelay: `${i * 0.08}s` }}>
          <article
            className={cardClass}
            style={{
              background: T.surface, borderRadius: '14px', overflow: 'hidden',
              border: `1px solid ${T.border}`, boxShadow: T.shadowMd,
              transition: 'transform 0.25s, box-shadow 0.25s',
              height: '100%', display: 'flex', flexDirection: 'column',
            }}
          >
            {c.image_url && (
              <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                <img src={c.image_url} alt={c.title || ''} style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: imageEffect === 'zoom-hover' ? 'transform 0.4s' : undefined,
                }} />
              </div>
            )}
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {c.tags && <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {c.tags.split(',').map((tag, j) => <span key={j} style={{ fontSize: '0.54rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: T.primarySoft, color: T.primaryText, fontWeight: 600, textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>{tag.trim()}</span>)}
              </div>}
              {c.title && <h3 style={{ fontSize: '1rem', fontWeight: 700, color: T.ink, marginBottom: '0.3rem', lineHeight: 1.35 }}>{c.title}</h3>}
              {c.subtitle && <p style={{ fontSize: '0.8rem', color: T.primary, fontWeight: 600, marginBottom: '0.3rem' }}>{c.subtitle}</p>}
              {c.body && <p style={{ fontSize: '0.78rem', color: T.inkSoft, lineHeight: 1.7, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.body}</p>}
              {c.link_url && <a href={c.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: T.primary, textDecoration: 'none', fontWeight: 600, marginTop: '0.6rem' }}>Learn more →</a>}
            </div>
          </article>
        </div>
      ))}
    </div>
  )
}

/* ─── Masonry ────────────────────────────────────────────── */
function MasonryLayout({ contents, max, effects }: { contents: SectionContent[]; max: number; effects: SectionEffects | null }) {
  const items = contents.slice(0, max)
  const columns: SectionContent[][] = [[], [], []]
  items.forEach((c, i) => columns[i % 3].push(c))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', alignItems: 'start' }}>
      {columns.map((col, ci) => (
        <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {col.map((c, i) => (
            <div key={c.id} className="stagger-child" style={{ animationDelay: `${(ci * col.length + i) * 0.08}s` }}>
              <MasonryCard content={c} effects={effects} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function MasonryCard({ content, effects }: { content: SectionContent; effects: SectionEffects | null }) {
  const [h, setH] = useState(false)
  const imageEffect = effects?.image_effect || 'none'
  const cardEffect = effects?.card_effect || 'none'
  const cardClass = cardEffect !== 'none' ? `card-effect-${cardEffect}` : ''

  return (
    <article
      className={cardClass}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: T.surface, borderRadius: '12px', overflow: 'hidden',
        border: `1px solid ${T.border}`,
        transition: 'transform 0.25s, box-shadow 0.25s',
        transform: h ? 'translateY(-2px)' : 'none',
        boxShadow: h ? T.shadowLg : T.shadowSm,
      }}
    >
      {content.image_url && (
        <div style={{ overflow: 'hidden', position: 'relative' }}>
          <img src={content.image_url} alt={content.title || ''} style={{
            width: '100%', height: 'auto', display: 'block',
            transition: imageEffect === 'zoom-hover' ? 'transform 0.4s' : undefined,
            transform: imageEffect === 'zoom-hover' && h ? 'scale(1.06)' : undefined,
          }} />
        </div>
      )}
      <div style={{ padding: '0.9rem' }}>
        {content.title && <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: T.ink, marginBottom: '0.25rem', lineHeight: 1.3 }}>{content.title}</h3>}
        {content.body && <p style={{ fontSize: '0.75rem', color: T.inkSoft, lineHeight: 1.6 }}>{content.body}</p>}
      </div>
    </article>
  )
}

/* ─── Featured ───────────────────────────────────────────── */
function FeaturedLayout({ contents, max, effects }: { contents: SectionContent[]; max: number; effects: SectionEffects | null }) {
  const items = contents.slice(0, max)
  if (items.length === 0) return null
  const [first, ...rest] = items
  const imageEffect = effects?.image_effect || 'none'
  const cardEffect = effects?.card_effect || 'none'
  const cardClass = cardEffect !== 'none' ? `card-effect-${cardEffect}` : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <article
        className={cardClass}
        style={{
          background: T.surface, borderRadius: '14px', overflow: 'hidden',
          border: `1px solid ${T.border}`, boxShadow: T.shadowMd,
        }}
      >
        {first.image_url && (
          <div style={{ height: '320px', overflow: 'hidden', position: 'relative' }}>
            <img src={first.image_url} alt={first.title || ''} style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: imageEffect === 'zoom-hover' ? 'transform 0.4s' : undefined,
              transform: imageEffect === 'zoom-hover' ? 'scale(1.04)' : undefined,
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.6))',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: '2rem', color: '#fff',
            }}>
              {first.tags && <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem' }}>
                {first.tags.split(',').map((tag, i) => <span key={i} style={{ fontSize: '0.54rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: 'rgba(255,255,255,0.15)', fontWeight: 600, textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>{tag.trim()}</span>)}
              </div>}
              {first.title && <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>{first.title}</h2>}
              {first.subtitle && <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>{first.subtitle}</p>}
            </div>
          </div>
        )}
        {!first.image_url && (
          <div style={{ padding: '2rem' }}>
            {first.title && <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: T.ink, marginBottom: '0.4rem' }}>{first.title}</h2>}
            {first.subtitle && <p style={{ fontSize: '0.95rem', color: T.muted, marginBottom: '0.6rem' }}>{first.subtitle}</p>}
            {first.body && <p style={{ fontSize: '0.88rem', color: T.inkSoft, lineHeight: 1.7 }}>{first.body}</p>}
          </div>
        )}
        {(first.body && first.image_url) && (
          <div style={{ padding: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: T.inkSoft, lineHeight: 1.7 }}>{first.body}</p>
          </div>
        )}
      </article>
      {rest.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(rest.length, 3)}, 1fr)`, gap: '1rem' }}>
          {rest.map(c => (
            <article key={c.id} style={{
              background: T.surface, borderRadius: '10px', overflow: 'hidden',
              border: `1px solid ${T.border}`, boxShadow: T.shadowSm,
            }}>
              {c.image_url && (
                <div style={{ height: '140px', overflow: 'hidden' }}>
                  <img src={c.image_url} alt={c.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '0.85rem' }}>
                {c.title && <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: T.ink, marginBottom: '0.2rem' }}>{c.title}</h4>}
                {c.body && <p style={{ fontSize: '0.72rem', color: T.inkSoft, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.body}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Split ──────────────────────────────────────────────── */
function SplitLayout({ contents, max, effects }: { contents: SectionContent[]; max: number; effects: SectionEffects | null }) {
  const items = contents.slice(0, max)
  const imageEffect = effects?.image_effect || 'none'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {items.map((c, i) => (
        <div key={c.id} className="stagger-child" style={{
          display: 'flex', gap: '2rem', alignItems: 'center',
          animationDelay: `${i * 0.1}s`,
          flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
        }}>
          {(c.image_url || c.video_url) && (
            <div style={{
              flex: '0 0 45%', borderRadius: '12px', overflow: 'hidden',
              boxShadow: T.shadowMd, minHeight: '220px',
            }}>
              {c.image_url && <img src={c.image_url} alt={c.title || ''} style={{
                width: '100%', height: '260px', objectFit: 'cover',
                transition: imageEffect === 'zoom-hover' ? 'transform 0.4s' : undefined,
              }} />}
              {c.video_url && !c.image_url && <video src={c.video_url} controls style={{ width: '100%', height: '260px', objectFit: 'cover' }} />}
            </div>
          )}
          <div style={{ flex: 1, padding: '0.5rem 0' }}>
            {c.tags && <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.6rem' }}>
              {c.tags.split(',').map((tag, j) => <span key={j} style={{ fontSize: '0.54rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: T.primarySoft, color: T.primaryText, fontWeight: 600, textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>{tag.trim()}</span>)}
            </div>}
            {c.title && <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: T.ink, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>{c.title}</h3>}
            {c.subtitle && <p style={{ fontSize: '0.85rem', color: T.muted, marginBottom: '0.4rem' }}>{c.subtitle}</p>}
            {c.body && <p style={{ fontSize: '0.82rem', color: T.inkSoft, lineHeight: 1.75, marginBottom: '0.8rem' }}>{c.body}</p>}
            {c.link_url && <a href={c.link_url} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              fontSize: '0.75rem', color: T.primary, textDecoration: 'none', fontWeight: 600,
            }}>Learn more →</a>}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Mosaic ─────────────────────────────────────────────── */
function MosaicLayout({ contents, max, effects }: { contents: SectionContent[]; max: number; effects: SectionEffects | null }) {
  const items = contents.slice(0, Math.min(max, 6))
  const imageEffect = effects?.image_effect || 'none'
  if (items.length === 0) return null

  const gridTemplate = items.length >= 4
    ? '"a a b c" "a a d e"'
    : items.length === 3
      ? '"a a b" "a a c"'
      : items.length === 2
        ? '"a b"'
        : '"a"'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: items.length >= 4 ? '1fr 1fr 1fr 1fr' : items.length === 3 ? '2fr 1fr' : items.length === 2 ? '1fr 1fr' : '1fr',
      gridTemplateRows: items.length >= 4 ? '200px 200px' : items.length === 3 ? '200px 200px' : 'auto',
      gridTemplateAreas: gridTemplate,
      gap: '0.75rem',
    }}>
      {items.map((c, i) => {
        const area = i === 0 ? 'a' : i === 1 ? 'b' : i === 2 ? 'c' : i === 3 ? 'd' : 'e'
        return (
          <div key={c.id} style={{
            gridArea: items.length >= 4 ? area : undefined,
            borderRadius: '12px', overflow: 'hidden', position: 'relative',
            cursor: 'pointer', boxShadow: T.shadowSm,
          }}>
            {c.image_url && (
              <img src={c.image_url} alt={c.title || ''} style={{
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                transition: imageEffect === 'zoom-hover' ? 'transform 0.4s' : undefined,
                minHeight: '200px',
              }} />
            )}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.65))',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: '1.25rem', color: '#fff',
            }}>
              {c.title && <h3 style={{ fontSize: i === 0 ? '1.15rem' : '0.85rem', fontWeight: 700, marginBottom: '0.15rem' }}>{c.title}</h3>}
              {c.subtitle && <p style={{ fontSize: '0.72rem', opacity: 0.8 }}>{c.subtitle}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Timeline ───────────────────────────────────────────── */
function TimelineLayout({ contents, max, effects }: { contents: SectionContent[]; max: number; effects: SectionEffects | null }) {
  const items = contents.slice(0, max)
  const imageEffect = effects?.image_effect || 'none'

  return (
    <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
      <div style={{
        position: 'absolute', left: '12px', top: 0, bottom: 0,
        width: '2px', background: `linear-gradient(${T.primary}, ${T.border})`,
      }} />
      {items.map((c, i) => (
        <div key={c.id} className="stagger-child" style={{
          position: 'relative', marginBottom: i < items.length - 1 ? '2rem' : 0,
          animationDelay: `${i * 0.12}s`,
        }}>
          <div style={{
            position: 'absolute', left: '-2.5rem', top: '0.35rem',
            width: '12px', height: '12px', borderRadius: '50%',
            background: T.primary, border: '3px solid #fff',
            boxShadow: `0 0 0 2px ${T.primaryRing}`,
          }} />
          <div style={{
            background: T.surface, borderRadius: '10px', padding: '1.25rem',
            border: `1px solid ${T.border}`, boxShadow: T.shadowSm,
            display: 'flex', gap: '1.25rem',
          }}>
            {c.image_url && (
              <div style={{
                width: '120px', height: '90px', borderRadius: '8px',
                overflow: 'hidden', flexShrink: 0,
              }}>
                <img src={c.image_url} alt={c.title || ''} style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: imageEffect === 'zoom-hover' ? 'transform 0.4s' : undefined,
                }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              {c.content_date && (
                <span style={{
                  fontSize: '0.56rem', fontWeight: 700, color: T.primaryText,
                  background: T.primarySoft, padding: '0.1rem 0.45rem', borderRadius: '3px',
                  fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase',
                  letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'inline-block',
                }}>{c.content_date.slice(0, 10)}</span>
              )}
              {c.title && <h3 style={{ fontSize: '1rem', fontWeight: 700, color: T.ink, marginBottom: '0.25rem' }}>{c.title}</h3>}
              {c.body && <p style={{ fontSize: '0.78rem', color: T.inkSoft, lineHeight: 1.7 }}>{c.body}</p>}
              {c.author && <span style={{ fontSize: '0.65rem', color: T.faint, marginTop: '0.3rem', display: 'block' }}>— {c.author}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Pricing ────────────────────────────────────────────── */
function PricingLayout({ contents, max, effects }: { contents: SectionContent[]; max: number; effects: SectionEffects | null }) {
  const items = contents.slice(0, Math.min(max, 4))
  const cardEffect = effects?.card_effect || 'none'
  const cardClass = cardEffect !== 'none' ? `card-effect-${cardEffect}` : ''

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`, gap: '1rem', alignItems: 'stretch' }}>
      {items.map((c, i) => {
        const isFeatured = i === 1
        return (
          <div key={c.id} className="stagger-child" style={{ animationDelay: `${i * 0.1}s` }}>
            <article
              className={cardClass}
              style={{
                background: isFeatured ? T.ink : T.surface,
                borderRadius: '14px', padding: '1.75rem',
                border: `1px solid ${isFeatured ? 'transparent' : T.border}`,
                boxShadow: isFeatured ? T.shadowXl : T.shadowSm,
                textAlign: 'center', position: 'relative',
                transition: 'transform 0.25s, box-shadow 0.25s',
              }}
            >
              {isFeatured && (
                <div style={{
                  position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                  background: T.gradPrimary, color: '#fff', fontSize: '0.55rem', fontWeight: 700,
                  padding: '0.2rem 0.8rem', borderRadius: '10px', textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>Popular</div>
              )}
              {c.tags && <div style={{
                fontSize: '0.6rem', fontWeight: 700, color: isFeatured ? T.primary : T.primaryText,
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem',
              }}>{c.tags.split(',')[0].trim()}</div>}
              {c.title && <h3 style={{
                fontSize: '1.15rem', fontWeight: 800,
                color: isFeatured ? '#fff' : T.ink, marginBottom: '0.3rem',
              }}>{c.title}</h3>}
              {c.subtitle && <div style={{
                fontSize: '1.8rem', fontWeight: 900,
                color: isFeatured ? '#fff' : T.primary, marginBottom: '0.3rem',
                letterSpacing: '-0.02em',
              }}>{c.subtitle}</div>}
              {c.body && <p style={{
                fontSize: '0.75rem', lineHeight: 1.7,
                color: isFeatured ? 'rgba(255,255,255,0.65)' : T.inkSoft,
                marginBottom: '1.25rem',
              }}>{c.body}</p>}
              {c.link_url && (
                <a href={c.link_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-block', padding: '0.6rem 1.8rem', borderRadius: '8px',
                  background: isFeatured ? '#fff' : T.gradPrimary,
                  color: isFeatured ? T.ink : '#fff',
                  textDecoration: 'none', fontWeight: 600, fontSize: '0.78rem',
                  width: '100%', boxSizing: 'border-box',
                }}>Get Started</a>
              )}
            </article>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Testimonial ────────────────────────────────────────── */
function TestimonialLayout({ contents, max, effects }: { contents: SectionContent[]; max: number; effects: SectionEffects | null }) {
  const items = contents.slice(0, max)
  const cardEffect = effects?.card_effect || 'none'
  const cardClass = cardEffect !== 'none' ? `card-effect-${cardEffect}` : ''

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: '1.25rem' }}>
      {items.map((c, i) => (
        <div key={c.id} className="stagger-child" style={{ animationDelay: `${i * 0.1}s` }}>
          <article
            className={cardClass}
            style={{
              background: T.surface, borderRadius: '14px', padding: '1.5rem',
              border: `1px solid ${T.border}`, boxShadow: T.shadowSm,
              position: 'relative',
              transition: 'transform 0.25s, box-shadow 0.25s',
            }}
          >
            <div style={{
              position: 'absolute', top: '1rem', right: '1.25rem',
              fontSize: '3rem', lineHeight: 1, color: T.border, fontFamily: 'Georgia, serif',
            }}>"</div>
            {c.body && <p style={{
              fontSize: '0.85rem', color: T.inkSoft, lineHeight: 1.75,
              marginBottom: '1.25rem', fontStyle: 'italic',
              position: 'relative', zIndex: 1,
            }}>&ldquo;{c.body}&rdquo;</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {c.image_url ? (
                <img src={c.image_url} alt={c.author || ''} style={{
                  width: 40, height: 40, borderRadius: '50%', objectFit: 'cover',
                }} />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: i % 2 === 0 ? T.gradPrimary : T.gradCool,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                }}>{(c.author || 'A').charAt(0).toUpperCase()}</div>
              )}
              <div>
                {c.author && <div style={{ fontSize: '0.82rem', fontWeight: 700, color: T.ink }}>{c.author}</div>}
                {c.title && <div style={{ fontSize: '0.65rem', color: T.muted }}>{c.title}</div>}
              </div>
            </div>
          </article>
        </div>
      ))}
    </div>
  )
}

/* ─── Showcase ───────────────────────────────────────────── */
function ShowcaseLayout({ contents, max, effects }: { contents: SectionContent[]; max: number; effects: SectionEffects | null }) {
  const items = contents.slice(0, max)
  const imageEffect = effects?.image_effect || 'none'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {items.map((c, i) => (
        <div key={c.id} className="stagger-child" style={{
          display: 'flex', gap: '2.5rem', alignItems: 'center',
          flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
          animationDelay: `${i * 0.12}s`,
        }}>
          <div style={{
            flex: '1 1 55%', borderRadius: '16px', overflow: 'hidden',
            boxShadow: T.shadowXl, position: 'relative',
          }}>
            {c.image_url && (
              <img src={c.image_url} alt={c.title || ''} style={{
                width: '100%', height: '340px', objectFit: 'cover', display: 'block',
                transition: imageEffect === 'zoom-hover' ? 'transform 0.5s' : undefined,
              }} />
            )}
            {c.video_url && !c.image_url && (
              <video src={c.video_url} controls style={{ width: '100%', height: '340px', objectFit: 'cover' }} />
            )}
          </div>
          <div style={{ flex: '1 1 40%', padding: '1rem 0' }}>
            {c.tags && <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              {c.tags.split(',').map((tag, j) => (
                <span key={j} style={{
                  fontSize: '0.55rem', padding: '0.15rem 0.55rem', borderRadius: '4px',
                  background: j === 0 ? T.primarySoft : T.bgSubtle,
                  color: j === 0 ? T.primaryText : T.muted,
                  fontWeight: 600, textTransform: 'uppercase',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.05em',
                }}>{tag.trim()}</span>
              ))}
            </div>}
            {c.title && <h3 style={{
              fontSize: '1.5rem', fontWeight: 900, color: T.ink,
              lineHeight: 1.2, marginBottom: '0.5rem', letterSpacing: '-0.025em',
            }}>{c.title}</h3>}
            {c.subtitle && <p style={{
              fontSize: '0.95rem', color: T.muted, marginBottom: '0.5rem',
              lineHeight: 1.5, fontWeight: 500,
            }}>{c.subtitle}</p>}
            {c.body && <p style={{
              fontSize: '0.82rem', color: T.inkSoft, lineHeight: 1.8,
              marginBottom: '1rem',
            }}>{c.body}</p>}
            {c.link_url && (
              <a href={c.link_url} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.6rem 1.4rem', borderRadius: '8px',
                background: T.gradPrimary, color: '#fff', textDecoration: 'none',
                fontWeight: 600, fontSize: '0.78rem',
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              }}>View Details →</a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
