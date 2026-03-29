import apiClient from './client'
import type { CV, PaginatedCVs, CVEducation, CVExperience, CVSkill, CVProject, CVCertification } from '@/types'

export const cvApi = {
  create: async (data: Partial<CV>): Promise<{ cv: CV }> => {
    const res = await apiClient.post('/cvs', data)
    return res.data
  },

  list: async (params?: { page?: number; per_page?: number }): Promise<PaginatedCVs> => {
    const res = await apiClient.get('/cvs', { params })
    return res.data
  },

  getById: async (id: number): Promise<{ cv: CV }> => {
    const res = await apiClient.get(`/cvs/${id}`)
    return res.data
  },

  update: async (id: number, data: Partial<CV>): Promise<{ cv: CV }> => {
    const res = await apiClient.patch(`/cvs/${id}`, data)
    return res.data
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/cvs/${id}`)
    return res.data
  },

  setDefault: async (id: number): Promise<{ cv: CV }> => {
    const res = await apiClient.put(`/cvs/${id}/default`)
    return res.data
  },

  // Education
  addEducation: async (cvId: number, data: Partial<CVEducation>): Promise<{ education: CVEducation }> => {
    const res = await apiClient.post(`/cvs/${cvId}/educations`, data)
    return res.data
  },
  updateEducation: async (cvId: number, eduId: number, data: Partial<CVEducation>): Promise<{ education: CVEducation }> => {
    const res = await apiClient.patch(`/cvs/${cvId}/educations/${eduId}`, data)
    return res.data
  },
  deleteEducation: async (cvId: number, eduId: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/cvs/${cvId}/educations/${eduId}`)
    return res.data
  },

  // Experience
  addExperience: async (cvId: number, data: Partial<CVExperience>): Promise<{ experience: CVExperience }> => {
    const res = await apiClient.post(`/cvs/${cvId}/experiences`, data)
    return res.data
  },
  updateExperience: async (cvId: number, expId: number, data: Partial<CVExperience>): Promise<{ experience: CVExperience }> => {
    const res = await apiClient.patch(`/cvs/${cvId}/experiences/${expId}`, data)
    return res.data
  },
  deleteExperience: async (cvId: number, expId: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/cvs/${cvId}/experiences/${expId}`)
    return res.data
  },

  // Skills
  addSkill: async (cvId: number, data: Partial<CVSkill>): Promise<{ skill: CVSkill }> => {
    const res = await apiClient.post(`/cvs/${cvId}/skills`, data)
    return res.data
  },
  updateSkill: async (cvId: number, skillId: number, data: Partial<CVSkill>): Promise<{ skill: CVSkill }> => {
    const res = await apiClient.patch(`/cvs/${cvId}/skills/${skillId}`, data)
    return res.data
  },
  deleteSkill: async (cvId: number, skillId: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/cvs/${cvId}/skills/${skillId}`)
    return res.data
  },

  // Projects
  addProject: async (cvId: number, data: Partial<CVProject>): Promise<{ project: CVProject }> => {
    const res = await apiClient.post(`/cvs/${cvId}/projects`, data)
    return res.data
  },
  updateProject: async (cvId: number, projectId: number, data: Partial<CVProject>): Promise<{ project: CVProject }> => {
    const res = await apiClient.patch(`/cvs/${cvId}/projects/${projectId}`, data)
    return res.data
  },
  deleteProject: async (cvId: number, projectId: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/cvs/${cvId}/projects/${projectId}`)
    return res.data
  },

  // Certifications
  addCertification: async (cvId: number, data: Partial<CVCertification>): Promise<{ certification: CVCertification }> => {
    const res = await apiClient.post(`/cvs/${cvId}/certifications`, data)
    return res.data
  },
  updateCertification: async (cvId: number, certId: number, data: Partial<CVCertification>): Promise<{ certification: CVCertification }> => {
    const res = await apiClient.patch(`/cvs/${cvId}/certifications/${certId}`, data)
    return res.data
  },
  deleteCertification: async (cvId: number, certId: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/cvs/${cvId}/certifications/${certId}`)
    return res.data
  },
}
