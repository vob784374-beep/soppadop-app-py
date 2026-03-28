import apiClient from './client'
import type { Resource, PaginatedResources, ResourceStats, ResourceFolder, CloudinaryAccount } from '@/types'

export const resourceApi = {
  upload: async (
    file: File,
    opts?: { collection?: string; folder?: string; display_name?: string; description?: string; tags?: string }
  ): Promise<{ message: string; resource: Resource }> => {
    const formData = new FormData()
    formData.append('file', file)
    if (opts?.collection) formData.append('collection', opts.collection)
    if (opts?.folder) formData.append('folder', opts.folder)
    if (opts?.display_name) formData.append('display_name', opts.display_name)
    if (opts?.description) formData.append('description', opts.description)
    if (opts?.tags) formData.append('tags', opts.tags)
    const res = await apiClient.post('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  list: async (params?: {
    page?: number; per_page?: number; file_type?: string;
    collection?: string; folder?: string; search?: string
  }): Promise<PaginatedResources> => {
    const res = await apiClient.get('/resources', { params })
    return res.data
  },

  getById: async (id: number): Promise<{ resource: Resource }> => {
    const res = await apiClient.get(`/resources/${id}`)
    return res.data
  },

  update: async (id: number, data: Partial<Resource>): Promise<{ resource: Resource }> => {
    const res = await apiClient.patch(`/resources/${id}`, data)
    return res.data
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/resources/${id}`)
    return res.data
  },

  download: async (id: number): Promise<{ download_url: string }> => {
    const res = await apiClient.get(`/resources/${id}/download`)
    return res.data
  },

  collections: async (): Promise<{ collections: { name: string; count: number }[] }> => {
    const res = await apiClient.get('/resources/collections')
    return res.data
  },

  folders: async (collection?: string): Promise<{ folders: ResourceFolder[] }> => {
    const res = await apiClient.get('/resources/folders', { params: { collection } })
    return res.data
  },

  cloudinaryFolders: async (path?: string): Promise<{ folders: { name: string; path: string }[] }> => {
    const res = await apiClient.get('/resources/cloudinary-folders', { params: { path } })
    return res.data
  },

  createFolder: async (path: string): Promise<{ message: string }> => {
    const res = await apiClient.post('/resources/cloudinary-folders', { path })
    return res.data
  },

  stats: async (): Promise<{ stats: ResourceStats }> => {
    const res = await apiClient.get('/resources/stats')
    return res.data
  },

  account: async (): Promise<{ account: CloudinaryAccount }> => {
    const res = await apiClient.get('/resources/account')
    return res.data
  },
}
