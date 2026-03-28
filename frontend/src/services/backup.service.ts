import { backupApi } from '@/api'
import type { BackupFile, BackupLog } from '@/types'

class BackupService {
  async create() {
    return backupApi.create()
  }

  async list(): Promise<BackupFile[]> {
    const { backups } = await backupApi.list()
    return backups
  }

  async restore(filename: string) {
    return backupApi.restore(filename)
  }

  async delete(filename: string) {
    return backupApi.delete(filename)
  }

  async logs(): Promise<BackupLog[]> {
    const { logs } = await backupApi.logs()
    return logs
  }

  downloadUrl(filename: string): string {
    return backupApi.downloadUrl(filename)
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
}

export const backupService = new BackupService()
