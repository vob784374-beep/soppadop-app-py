import { cvApi } from '@/api'
import type { CV, PaginatedCVs, CVEducation, CVExperience, CVSkill, CVProject, CVCertification } from '@/types'

class CVService {
  async create(data: Partial<CV>): Promise<CV> {
    const { cv } = await cvApi.create(data)
    return cv
  }

  async list(params?: { page?: number; per_page?: number }): Promise<PaginatedCVs> {
    return cvApi.list(params)
  }

  async getById(id: number): Promise<CV> {
    const { cv } = await cvApi.getById(id)
    return cv
  }

  async update(id: number, data: Partial<CV>): Promise<CV> {
    const { cv } = await cvApi.update(id, data)
    return cv
  }

  async delete(id: number): Promise<void> {
    await cvApi.delete(id)
  }

  async setDefault(id: number): Promise<CV> {
    const { cv } = await cvApi.setDefault(id)
    return cv
  }

  async addEducation(cvId: number, data: Partial<CVEducation>): Promise<CVEducation> {
    const { education } = await cvApi.addEducation(cvId, data)
    return education
  }

  async updateEducation(cvId: number, eduId: number, data: Partial<CVEducation>): Promise<CVEducation> {
    const { education } = await cvApi.updateEducation(cvId, eduId, data)
    return education
  }

  async deleteEducation(cvId: number, eduId: number): Promise<void> {
    await cvApi.deleteEducation(cvId, eduId)
  }

  async addExperience(cvId: number, data: Partial<CVExperience>): Promise<CVExperience> {
    const { experience } = await cvApi.addExperience(cvId, data)
    return experience
  }

  async updateExperience(cvId: number, expId: number, data: Partial<CVExperience>): Promise<CVExperience> {
    const { experience } = await cvApi.updateExperience(cvId, expId, data)
    return experience
  }

  async deleteExperience(cvId: number, expId: number): Promise<void> {
    await cvApi.deleteExperience(cvId, expId)
  }

  async addSkill(cvId: number, data: Partial<CVSkill>): Promise<CVSkill> {
    const { skill } = await cvApi.addSkill(cvId, data)
    return skill
  }

  async updateSkill(cvId: number, skillId: number, data: Partial<CVSkill>): Promise<CVSkill> {
    const { skill } = await cvApi.updateSkill(cvId, skillId, data)
    return skill
  }

  async deleteSkill(cvId: number, skillId: number): Promise<void> {
    await cvApi.deleteSkill(cvId, skillId)
  }

  async addProject(cvId: number, data: Partial<CVProject>): Promise<CVProject> {
    const { project } = await cvApi.addProject(cvId, data)
    return project
  }

  async updateProject(cvId: number, projectId: number, data: Partial<CVProject>): Promise<CVProject> {
    const { project } = await cvApi.updateProject(cvId, projectId, data)
    return project
  }

  async deleteProject(cvId: number, projectId: number): Promise<void> {
    await cvApi.deleteProject(cvId, projectId)
  }

  async addCertification(cvId: number, data: Partial<CVCertification>): Promise<CVCertification> {
    const { certification } = await cvApi.addCertification(cvId, data)
    return certification
  }

  async updateCertification(cvId: number, certId: number, data: Partial<CVCertification>): Promise<CVCertification> {
    const { certification } = await cvApi.updateCertification(cvId, certId, data)
    return certification
  }

  async deleteCertification(cvId: number, certId: number): Promise<void> {
    await cvApi.deleteCertification(cvId, certId)
  }
}

export const cvService = new CVService()
