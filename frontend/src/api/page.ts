import apiClient from './client'
import type { PageSection, SectionContent, PaginatedSections, PaginatedContents, TemplateData, SectionOverview, SectionGroupInfo } from '@/types'

export interface SectionGroup {
  group: string | null
  is_template: boolean
  sort_order: number
  sections: PageSection[]
}

export const publicPageApi = {
  getPage: async (): Promise<{ groups: SectionGroup[] }> => {
    const res = await apiClient.get('/public-page')
    return res.data
  },

  getSection: async (sectionId: number, params?: { page?: number; per_page?: number }): Promise<PaginatedContents> => {
    const res = await apiClient.get(`/public-page/sections/${sectionId}`, { params })
    return res.data
  },
}

export const adminPageApi = {
  listSections: async (params?: { page?: number; per_page?: number; section_type?: string }): Promise<PaginatedSections> => {
    const res = await apiClient.get('/admin/page/sections', { params })
    return res.data
  },

  getSection: async (id: number): Promise<{ section: PageSection }> => {
    const res = await apiClient.get(`/admin/page/sections/${id}`)
    return res.data
  },

  createSection: async (data: Partial<PageSection>): Promise<{ section: PageSection; message: string }> => {
    const res = await apiClient.post('/admin/page/sections', data)
    return res.data
  },

  updateSection: async (id: number, data: Partial<PageSection>): Promise<{ section: PageSection; message: string }> => {
    const res = await apiClient.patch(`/admin/page/sections/${id}`, data)
    return res.data
  },

  deleteSection: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/admin/page/sections/${id}`)
    return res.data
  },

  reorderSections: async (orders: { id: number; sort_order: number }[]): Promise<{ message: string }> => {
    const res = await apiClient.post('/admin/page/sections/reorder', { orders })
    return res.data
  },

  listContents: async (sectionId: number, params?: { page?: number; per_page?: number }): Promise<PaginatedContents> => {
    const res = await apiClient.get(`/admin/page/sections/${sectionId}/contents`, { params })
    return res.data
  },

  createContent: async (data: Partial<SectionContent> & { section_id: number }): Promise<{ content: SectionContent; message: string }> => {
    const res = await apiClient.post('/admin/page/contents', data)
    return res.data
  },

  updateContent: async (id: number, data: Partial<SectionContent>): Promise<{ content: SectionContent; message: string }> => {
    const res = await apiClient.patch(`/admin/page/contents/${id}`, data)
    return res.data
  },

  deleteContent: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/admin/page/contents/${id}`)
    return res.data
  },

  listTemplates: async (): Promise<TemplateData> => {
    const res = await apiClient.get('/admin/page/templates')
    return res.data
  },

  applySectionTemplate: async (templateId: string, sectionId?: number): Promise<{ section: PageSection; message: string }> => {
    const res = await apiClient.post(`/admin/page/templates/section/${templateId}/apply`, sectionId ? { section_id: sectionId } : {})
    return res.data
  },

  applyPageTemplate: async (templateId: string): Promise<{ sections: PageSection[]; message: string }> => {
    const res = await apiClient.post(`/admin/page/templates/page/${templateId}/apply`)
    return res.data
  },

  getAppliedTemplates: async (): Promise<{ applied: string[] }> => {
    const res = await apiClient.get('/admin/page/templates/page/applied')
    return res.data
  },

  getOverview: async (): Promise<SectionOverview> => {
    const res = await apiClient.get('/admin/page/sections/overview')
    return res.data
  },

  getSectionsByStatus: async (status: 'published' | 'draft'): Promise<{ status: string; count: number; sections: PageSection[] }> => {
    const res = await apiClient.get(`/admin/page/sections/by-status/${status}`)
    return res.data
  },

  listGroups: async (): Promise<{ groups: SectionGroupInfo[]; total: number }> => {
    const res = await apiClient.get('/admin/page/sections/groups')
    return res.data
  },

  publishGroup: async (groupName: string): Promise<{ count: number; message: string }> => {
    const res = await apiClient.post(`/admin/page/sections/groups/${encodeURIComponent(groupName)}/publish`)
    return res.data
  },

  unpublishGroup: async (groupName: string): Promise<{ count: number; message: string }> => {
    const res = await apiClient.post(`/admin/page/sections/groups/${encodeURIComponent(groupName)}/unpublish`)
    return res.data
  },
}
