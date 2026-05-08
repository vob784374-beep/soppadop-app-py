import { publicPageApi, adminPageApi } from '@/api'
import type { PageSection, SectionContent, PaginatedSections, PaginatedContents, TemplateData, SectionOverview } from '@/types'

class PublicPageService {
  async getPage(): Promise<PageSection[]> {
    const { groups } = await publicPageApi.getPage()
    // Flatten groups into a flat sections array, preserving group order
    const sections: PageSection[] = []
    for (const group of groups) {
      sections.push(...group.sections)
    }
    return sections
  }

  async getSection(sectionId: number, page = 1, perPage = 20): Promise<PaginatedContents> {
    return publicPageApi.getSection(sectionId, { page, per_page: perPage })
  }
}

class AdminPageService {
  async listSections(params?: { page?: number; per_page?: number; section_type?: string }): Promise<PaginatedSections> {
    return adminPageApi.listSections(params)
  }

  async getSection(id: number): Promise<PageSection> {
    const { section } = await adminPageApi.getSection(id)
    return section
  }

  async createSection(data: Partial<PageSection>): Promise<PageSection> {
    const { section } = await adminPageApi.createSection(data)
    return section
  }

  async updateSection(id: number, data: Partial<PageSection>): Promise<PageSection> {
    const { section } = await adminPageApi.updateSection(id, data)
    return section
  }

  async deleteSection(id: number): Promise<void> {
    await adminPageApi.deleteSection(id)
  }

  async reorderSections(orders: { id: number; sort_order: number }[]): Promise<void> {
    await adminPageApi.reorderSections(orders)
  }

  async listContents(sectionId: number, page = 1, perPage = 50): Promise<PaginatedContents> {
    return adminPageApi.listContents(sectionId, { page, per_page: perPage })
  }

  async createContent(data: Partial<SectionContent> & { section_id: number }): Promise<SectionContent> {
    const { content } = await adminPageApi.createContent(data)
    return content
  }

  async updateContent(id: number, data: Partial<SectionContent>): Promise<SectionContent> {
    const { content } = await adminPageApi.updateContent(id, data)
    return content
  }

  async deleteContent(id: number): Promise<void> {
    await adminPageApi.deleteContent(id)
  }

  async listTemplates(): Promise<TemplateData> {
    return adminPageApi.listTemplates()
  }

  async applySectionTemplate(templateId: string, sectionId?: number): Promise<PageSection> {
    const { section } = await adminPageApi.applySectionTemplate(templateId, sectionId)
    return section
  }

  async applyPageTemplate(templateId: string): Promise<PageSection[]> {
    const { sections } = await adminPageApi.applyPageTemplate(templateId)
    return sections
  }

  async getAppliedTemplates(): Promise<string[]> {
    const { applied } = await adminPageApi.getAppliedTemplates()
    return applied
  }

  async getOverview(): Promise<SectionOverview> {
    return adminPageApi.getOverview()
  }

  async getSectionsByStatus(status: 'published' | 'draft'): Promise<{ status: string; count: number; sections: PageSection[] }> {
    return adminPageApi.getSectionsByStatus(status)
  }

  async publishGroup(groupName: string): Promise<number> {
    const { count } = await adminPageApi.publishGroup(groupName)
    return count
  }

  async unpublishGroup(groupName: string): Promise<number> {
    const { count } = await adminPageApi.unpublishGroup(groupName)
    return count
  }
}

export const publicPageService = new PublicPageService()
export const adminPageService = new AdminPageService()
