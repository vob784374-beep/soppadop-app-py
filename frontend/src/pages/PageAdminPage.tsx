import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { adminPageService } from '@/services'
import { Button } from '@/components/ui'
import { useApi, useMutation } from '@/hooks'
import { useToast } from '@/components/ui'
import { theme as T } from '@/styles/theme'
import { Plus, Layout } from '@/components/ui/Icons'
import {
  SectionsTab, TemplateModal, SectionFormModal, ContentFormModal,
} from '@/components/page'
import type { PageSection, SectionContent } from '@/types'

export default function PageAdminPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  const [showSectionModal, setShowSectionModal] = useState(false)
  const [editingSection, setEditingSection] = useState<PageSection | null>(null)

  const [showContentModal, setShowContentModal] = useState(false)
  const [editingContent, setEditingContent] = useState<SectionContent | null>(null)

  const { data, loading } = useApi(
    () => adminPageService.listSections({ per_page: 100 }),
    [refreshKey]
  )

  const { data: overviewData } = useApi(
    () => adminPageService.getOverview(),
    [refreshKey]
  )

  const { data: contentsData, loading: contentsLoading } = useApi(
    () => selectedSection ? adminPageService.listContents(selectedSection.id) : Promise.resolve(null),
    [selectedSection?.id, refreshKey]
  )

  const { data: templatesData } = useApi(
    () => adminPageService.listTemplates(),
    []
  )

  const { data: appliedData } = useApi(
    () => adminPageService.getAppliedTemplates(),
    [refreshKey]
  )

  const { mutate: deleteSectionMut } = useMutation((id: number) => adminPageService.deleteSection(id))
  const { mutate: deleteContentMut } = useMutation((id: number) => adminPageService.deleteContent(id))

  const sections = data?.sections || []
  const contents = contentsData?.contents || []
  const templates = templatesData || { section_templates: [], page_templates: [] }
  const appliedTemplates = appliedData || []
  const overviewSummary = overviewData?.summary || null
  const publishedCount = overviewSummary?.published ?? sections.filter(s => s.status === 'published').length
  const totalContents = sections.reduce((sum, s) => sum + (s.content_count || 0), 0)

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  const handleDeleteSection = async (section: PageSection) => {
    if (!confirm(`Delete "${section.title}" and all its contents?`)) return
    await deleteSectionMut(section.id)
    toast.success('Section deleted')
    if (selectedSection?.id === section.id) setSelectedSection(null)
    refresh()
  }

  const handleDeleteContent = async (content: SectionContent) => {
    if (!confirm(`Delete "${content.title || 'this item'}"?`)) return
    await deleteContentMut(content.id)
    toast.success('Content deleted')
    refresh()
  }

  const handleTogglePublish = async (section: PageSection) => {
    const newStatus = section.status === 'published' ? 'draft' : 'published'
    await adminPageService.updateSection(section.id, { status: newStatus })
    toast.success(newStatus === 'published' ? 'Published' : 'Unpublished')
    refresh()
  }

  const handleSaveSection = async (form: Partial<PageSection>) => {
    if (editingSection) {
      await adminPageService.updateSection(editingSection.id, form)
      toast.success('Section updated')
    } else {
      await adminPageService.createSection(form)
      toast.success('Section created')
    }
    setShowSectionModal(false)
    setEditingSection(null)
    refresh()
  }

  const handleSaveContent = async (form: Partial<SectionContent> & { section_id?: number }) => {
    if (editingContent) {
      await adminPageService.updateContent(editingContent.id, form)
      toast.success('Content updated')
    } else {
      await adminPageService.createContent(form as any)
      toast.success('Content created')
    }
    setShowContentModal(false)
    setEditingContent(null)
    refresh()
  }

  const handleApplySectionTemplate = async (templateId: string) => {
    const section = await adminPageService.applySectionTemplate(templateId)
    toast.success(`Section created: ${section.title}`)
    setSelectedSection(section)
    refresh()
  }

  const handleAttachSectionTemplate = async (templateId: string) => {
    if (selectedSection) {
      await adminPageService.applySectionTemplate(templateId, selectedSection.id)
      toast.success('Template content added')
      refresh()
    }
  }

  const handleApplyPageTemplate = async (templateId: string) => {
    const newSections = await adminPageService.applyPageTemplate(templateId)
    toast.success(`Page created: ${newSections.length} sections`)
    if (newSections.length > 0) setSelectedSection(newSections[0])
    refresh()
  }

  const handlePublishGroup = async (groupName: string) => {
    const count = await adminPageService.publishGroup(groupName)
    toast.success(`Published ${count} sections in "${groupName}"`)
    refresh()
  }

  const handleUnpublishGroup = async (groupName: string) => {
    const count = await adminPageService.unpublishGroup(groupName)
    toast.success(`Unpublished ${count} sections in "${groupName}"`)
    refresh()
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: '1.5rem', gap: '1rem',
      }}>
        <div>
          <h1 style={{
            fontSize: '1.35rem', fontWeight: 800, color: T.ink,
            letterSpacing: '-0.025em', marginBottom: '0.2rem',
          }}>{t('pageAdmin.title')}</h1>
          <p style={{ color: T.muted, fontSize: '0.78rem' }}>{t('pageAdmin.description')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" onClick={() => setShowTemplateModal(true)}>
            <Layout size={13} /> {t('pageAdmin.fromTemplate', 'From Template')}
          </Button>
          <Button onClick={() => { setEditingSection(null); setShowSectionModal(true) }}>
            <Plus size={13} /> {t('pageAdmin.addSection')}
          </Button>
        </div>
      </div>

      {/* Sections */}
      <SectionsTab
        sections={sections}
        contents={contents}
        loading={loading}
        contentsLoading={contentsLoading}
        selectedSection={selectedSection}
        publishedCount={publishedCount}
        totalContents={totalContents}
        overviewSummary={overviewSummary}
        onSelectSection={setSelectedSection}
        onEditSection={(s) => { setEditingSection(s); setShowSectionModal(true) }}
        onDeleteSection={handleDeleteSection}
        onTogglePublish={handleTogglePublish}
        onEditContent={(c) => { setEditingContent(c); setShowContentModal(true) }}
        onDeleteContent={handleDeleteContent}
        onAddContent={() => { setEditingContent(null); setShowContentModal(true) }}
        onOpenTemplates={() => setShowTemplateModal(true)}
        onPublishGroup={handlePublishGroup}
        onUnpublishGroup={handleUnpublishGroup}
      />

      {/* Modals */}
      <SectionFormModal
        open={showSectionModal}
        onClose={() => { setShowSectionModal(false); setEditingSection(null) }}
        onSave={handleSaveSection}
        section={editingSection}
      />
      {selectedSection && (
        <ContentFormModal
          open={showContentModal}
          onClose={() => { setShowContentModal(false); setEditingContent(null) }}
          onSave={handleSaveContent}
          content={editingContent}
          sectionId={selectedSection.id}
        />
      )}
      <TemplateModal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        templates={templates}
        appliedTemplates={appliedTemplates}
        onApplySection={handleApplySectionTemplate}
        onApplyPage={handleApplyPageTemplate}
        onAttachToSection={handleAttachSectionTemplate}
        selectedSectionTitle={selectedSection?.title || null}
      />
    </div>
  )
}
