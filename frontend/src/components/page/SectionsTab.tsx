import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { theme as T } from '@/styles/theme'
import { Plus, BookOpen, Layout, Check, FileText, Layers, Eye, EyeOff, ChevronDown, ChevronRight } from '@/components/ui/Icons'
import { StatsBar, SectionCard, ContentCard } from '@/components/page'
import type { PageSection, SectionContent, SectionOverviewSummary } from '@/types'

type TabKey = 'all' | 'published' | 'draft'

interface SectionsTabProps {
  sections: PageSection[]
  contents: SectionContent[]
  loading: boolean
  contentsLoading: boolean
  selectedSection: PageSection | null
  publishedCount: number
  totalContents: number
  overviewSummary?: SectionOverviewSummary | null
  onSelectSection: (section: PageSection | null) => void
  onEditSection: (section: PageSection) => void
  onDeleteSection: (section: PageSection) => void
  onTogglePublish: (section: PageSection) => void
  onEditContent: (content: SectionContent) => void
  onDeleteContent: (content: SectionContent) => void
  onAddContent: () => void
  onOpenTemplates: () => void
  onPublishGroup: (groupName: string) => void
  onUnpublishGroup: (groupName: string) => void
}

export default function SectionsTab({
  sections, contents, loading, contentsLoading,
  selectedSection, publishedCount, totalContents, overviewSummary,
  onSelectSection, onEditSection, onDeleteSection, onTogglePublish,
  onEditContent, onDeleteContent, onAddContent, onOpenTemplates,
  onPublishGroup, onUnpublishGroup,
}: SectionsTabProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const draftCount = sections.filter(s => s.status === 'draft').length

  const filteredSections = activeTab === 'all'
    ? sections
    : sections.filter(s => s.status === activeTab)

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'all', label: t('pageAdmin.allSections', 'All'), icon: <Layers size={13} />, count: sections.length },
    { key: 'published', label: t('pageAdmin.published', 'Published'), icon: <Check size={13} />, count: overviewSummary?.published ?? publishedCount },
    { key: 'draft', label: t('pageAdmin.draft', 'Draft'), icon: <FileText size={13} />, count: overviewSummary?.draft ?? draftCount },
  ]

  const grouped = groupByTemplate(filteredSections)

  return (
    <>
      {/* Stats */}
      <StatsBar
        totalSections={sections.length}
        publishedCount={publishedCount}
        totalContents={totalContents}
        selectedTitle={selectedSection?.title || null}
      />

      {/* Main Layout */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* Sections List */}
        <div style={{ flex: '0 0 360px' }}>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex', gap: '0.25rem',
            background: T.surface, borderRadius: '10px 10px 0 0',
            border: `1px solid ${T.border}`, padding: '0.35rem 0.4rem 0 0.4rem',
          }}>
            {tabs.map(tab => (
              <TabButton
                key={tab.key}
                active={activeTab === tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  onSelectSection(null)
                }}
                icon={tab.icon}
                label={tab.label}
                count={tab.count}
              />
            ))}
          </div>

          <PanelHeader title={t('pageAdmin.sections')} count={filteredSections.length} />
          <div style={{
            background: T.surface, borderRadius: '0 0 10px 10px',
            border: `1px solid ${T.border}`, borderTop: 'none',
            maxHeight: '500px', overflowY: 'auto', padding: '0.4rem',
          }}>
            {loading ? (
              <EmptyState text="Loading..." />
            ) : filteredSections.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={32} color={T.faint} />}
                text={activeTab === 'all'
                  ? t('pageAdmin.noSections')
                  : t('pageAdmin.noSectionsInTab', `No ${activeTab} sections`)
                }
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {grouped.map(group => (
                  <TemplateGroup
                    key={group.key}
                    group={group}
                    selectedSection={selectedSection}
                    onSelectSection={onSelectSection}
                    onEditSection={onEditSection}
                    onDeleteSection={onDeleteSection}
                    onTogglePublish={onTogglePublish}
                    onPublishGroup={onPublishGroup}
                    onUnpublishGroup={onUnpublishGroup}
                    filteredSections={filteredSections}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contents Panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!selectedSection ? (
            <div style={{
              background: T.surface, borderRadius: '10px',
              border: `1px solid ${T.border}`, padding: '3.5rem 2rem', textAlign: 'center',
            }}>
              <BookOpen size={40} color={T.faint} />
              <p style={{ color: T.faint, fontSize: '0.82rem', fontWeight: 500, marginTop: '0.85rem' }}>
                {t('pageAdmin.selectSection')}
              </p>
            </div>
          ) : (
            <div>
              <PanelHeader
                title={selectedSection.title}
                subtitle={`${selectedSection.section_type} · ${selectedSection.layout} · ${contents.length} items`}
                action={
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <Button size="sm" variant="outline" onClick={onOpenTemplates}>
                      <Layout size={11} /> {t('pageAdmin.template', 'Template')}
                    </Button>
                    <Button size="sm" onClick={onAddContent}>
                      <Plus size={11} /> {t('pageAdmin.addContent')}
                    </Button>
                  </div>
                }
              />
              <div style={{
                background: T.surface, borderRadius: '0 0 10px 10px',
                border: `1px solid ${T.border}`, borderTop: 'none',
                maxHeight: '500px', overflowY: 'auto', padding: '0.6rem',
              }}>
                {contentsLoading ? (
                  <EmptyState text="Loading..." />
                ) : contents.length === 0 ? (
                  <EmptyState text={t('pageAdmin.noContents')} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {contents.map(content => (
                      <ContentCard
                        key={content.id}
                        content={content}
                        onEdit={onEditContent}
                        onDelete={onDeleteContent}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ─── Template Group ─────────────────────────────────────── */
interface GroupData {
  key: string
  label: string
  isTemplate: boolean
  sections: PageSection[]
  publishedCount: number
  draftCount: number
}

function groupByTemplate(sections: PageSection[]): GroupData[] {
  const map = new Map<string, GroupData>()

  for (const s of sections) {
    const key = s.template_group || `__single_${s.id}`
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: s.template_group || s.title,
        isTemplate: !!s.template_group,
        sections: [],
        publishedCount: 0,
        draftCount: 0,
      })
    }
    const g = map.get(key)!
    g.sections.push(s)
    if (s.status === 'published') g.publishedCount++
    else g.draftCount++
  }

  return Array.from(map.values())
}

function TemplateGroup({
  group, selectedSection, filteredSections,
  onSelectSection, onEditSection, onDeleteSection, onTogglePublish,
  onPublishGroup, onUnpublishGroup,
}: {
  group: GroupData
  selectedSection: PageSection | null
  filteredSections: PageSection[]
  onSelectSection: (s: PageSection | null) => void
  onEditSection: (s: PageSection) => void
  onDeleteSection: (s: PageSection) => void
  onTogglePublish: (s: PageSection) => void
  onPublishGroup: (name: string) => void
  onUnpublishGroup: (name: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const allPublished = group.draftCount === 0 && group.publishedCount > 0

  if (!group.isTemplate) {
    return (
      <>
        {group.sections.map(section => (
          <SectionCard
            key={section.id}
            section={section}
            selected={selectedSection?.id === section.id}
            onSelect={(id) => onSelectSection(filteredSections.find(s => s.id === id) || null)}
            onEdit={onEditSection}
            onDelete={onDeleteSection}
            onTogglePublish={onTogglePublish}
          />
        ))}
      </>
    )
  }

  return (
    <div>
      {/* Group Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.45rem 0.6rem',
        background: T.bgSubtle,
        borderRadius: '6px',
        border: `1px solid ${T.borderLt}`,
        marginBottom: '0.15rem',
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', flex: 1, minWidth: 0 }}
          onClick={() => setCollapsed(c => !c)}
        >
          {collapsed ? <ChevronRight size={13} color={T.muted} /> : <ChevronDown size={13} color={T.muted} />}
          <Layout size={12} color={T.primary} />
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, color: T.inkSoft,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{group.label}</span>
          <span style={{
            fontSize: '0.55rem', padding: '0.06rem 0.3rem', borderRadius: 4,
            background: T.border, color: T.inkSoft,
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
          }}>{group.sections.length}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
          {allPublished ? (
            <Button size="sm" variant="ghost"
              title="Unpublish All"
              onClick={(e) => { e.stopPropagation(); onUnpublishGroup(group.label) }}>
              <EyeOff size={12} /> <span style={{ fontSize: '0.6rem', marginLeft: 2 }}>Unpublish All</span>
            </Button>
          ) : (
            <Button size="sm" variant="ghost"
              title="Publish All"
              onClick={(e) => { e.stopPropagation(); onPublishGroup(group.label) }}>
              <Eye size={12} /> <span style={{ fontSize: '0.6rem', marginLeft: 2 }}>Publish All</span>
            </Button>
          )}
        </div>
      </div>

      {/* Group Sections */}
      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.6rem' }}>
          {group.sections.map(section => (
            <SectionCard
              key={section.id}
              section={section}
              selected={selectedSection?.id === section.id}
              onSelect={(id) => onSelectSection(filteredSections.find(s => s.id === id) || null)}
              onEdit={onEditSection}
              onDelete={onDeleteSection}
              onTogglePublish={onTogglePublish}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Tab Button ────────────────────────────────────────── */
function TabButton({ active, onClick, icon, label, count }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        padding: '0.5rem 0.85rem', borderRadius: '8px 8px 0 0',
        border: 'none', cursor: 'pointer',
        background: active ? T.primarySoft : T.bgSubtle,
        color: active ? T.primary : T.inkSoft,
        fontSize: '0.76rem', fontWeight: active ? 700 : 600,
        transition: 'all 0.15s ease',
        borderBottom: active ? `2px solid ${T.primary}` : '2px solid transparent',
        position: 'relative',
      }}
    >
      {icon}
      {label}
      <span style={{
        fontSize: '0.6rem', padding: '0.08rem 0.35rem', borderRadius: 4,
        background: active ? T.primary : T.border,
        color: active ? '#fff' : T.inkSoft,
        fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
        minWidth: '18px', textAlign: 'center',
      }}>{count}</span>
    </button>
  )
}

/* ─── Panel Header ──────────────────────────────────────── */
function PanelHeader({ title, subtitle, count, action }: {
  title: string; subtitle?: string; count?: number; action?: React.ReactNode
}) {
  return (
    <div style={{
      background: T.surface, borderRadius: '10px 10px 0 0',
      border: `1px solid ${T.border}`, padding: '0 1rem', height: '44px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: 4, height: 18, borderRadius: 2, background: T.primary }} />
        <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: T.ink, margin: 0 }}>{title}</h3>
        {count !== undefined && (
          <span style={{
            fontSize: '0.56rem', padding: '0.08rem 0.35rem', borderRadius: 4,
            background: T.primarySoft, color: T.primary,
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
          }}>{count}</span>
        )}
      </div>
      {subtitle && <span style={{ fontSize: '0.56rem', color: T.faint }}>{subtitle}</span>}
      {action}
    </div>
  )
}

/* ─── Empty State ────────────────────────────────────────── */
function EmptyState({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      {icon}
      <p style={{ color: T.faint, fontSize: '0.78rem', marginTop: '0.6rem' }}>{text}</p>
    </div>
  )
}
