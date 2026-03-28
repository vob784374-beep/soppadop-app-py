import apiClient from './client'
import type { BackupFile, BackupLog } from '@/types'

export const backupApi = {
  create: async (): Promise<{ message: string; backup: { filename: string; size: number; created_at: string } }> => {
    const res = await apiClient.post('/backup/create')
    return res.data
  },

  list: async (): Promise<{ backups: BackupFile[]; total: number }> => {
    const res = await apiClient.get('/backup/list')
    return res.data
  },

  restore: async (filename: string): Promise<{ message: string }> => {
    const res = await apiClient.post('/backup/restore', { filename })
    return res.data
  },

  delete: async (filename: string): Promise<{ message: string }> => {
    const res = await apiClient.delete('/backup/delete', { data: { filename } })
    return res.data
  },

  logs: async (): Promise<{ logs: BackupLog[]; total: number }> => {
    const res = await apiClient.get('/backup/logs')
    return res.data
  },

  downloadUrl: (filename: string): string => {
    return `/api/backup/download/${filename}`
  },
}
