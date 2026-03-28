import { resourceApi } from '@/api'
import type { Resource, PaginatedResources, ResourceStats, ResourceFolder, CloudinaryAccount } from '@/types'

class ResourceService {
  async upload(file: File, opts?: { collection?: string; folder?: string; display_name?: string; description?: string; tags?: string }): Promise<Resource> {
    const { resource } = await resourceApi.upload(file, opts)
    return resource
  }

  async list(params?: { page?: number; per_page?: number; file_type?: string; collection?: string; folder?: string; search?: string }): Promise<PaginatedResources> {
    return resourceApi.list(params)
  }

  async getById(id: number): Promise<Resource> {
    const { resource } = await resourceApi.getById(id)
    return resource
  }

  async update(id: number, data: Partial<Resource>): Promise<Resource> {
    const { resource } = await resourceApi.update(id, data)
    return resource
  }

  async delete(id: number): Promise<void> {
    await resourceApi.delete(id)
  }

  async getDownloadUrl(id: number): Promise<string> {
    const { download_url } = await resourceApi.download(id)
    return download_url
  }

  async collections(): Promise<{ name: string; count: number }[]> {
    const { collections } = await resourceApi.collections()
    return collections
  }

  async folders(collection?: string): Promise<ResourceFolder[]> {
    const { folders } = await resourceApi.folders(collection)
    return folders
  }

  async cloudinaryFolders(path?: string): Promise<{ name: string; path: string }[]> {
    const { folders } = await resourceApi.cloudinaryFolders(path)
    return folders
  }

  async createFolder(path: string): Promise<void> {
    await resourceApi.createFolder(path)
  }

  async stats(): Promise<ResourceStats> {
    const { stats } = await resourceApi.stats()
    return stats
  }

  async account(): Promise<CloudinaryAccount> {
    const { account } = await resourceApi.account()
    return account
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }

  getFileIcon(fileType: string): string {
    const icons: Record<string, string> = {
      image: 'IMG', video: 'VID', document: 'DOC', archive: 'ZIP', other: 'FILE',
    }
    return icons[fileType] || 'FILE'
  }

  getFileTypeColor(fileType: string): string {
    const colors: Record<string, string> = {
      image: 'green', video: 'purple', document: 'blue', archive: 'yellow', other: 'gray',
    }
    return colors[fileType] || 'gray'
  }
}

export const resourceService = new ResourceService()
