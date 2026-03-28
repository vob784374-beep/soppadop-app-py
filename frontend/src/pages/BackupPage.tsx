import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { backupService } from '@/services'
import { Button, Card, Badge, Table } from '@/components/ui'
import { useApi, useMutation } from '@/hooks'
import { useToast } from '@/components/ui'
import type { BackupFile, BackupLog } from '@/types'

export default function BackupPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'files' | 'logs'>('files')
  const { data: backups, loading, refetch: refetchBackups } = useApi(() => backupService.list())
  const { data: logs, refetch: refetchLogs } = useApi(() => backupService.logs())
  const { mutate: createBackup, loading: creating } = useMutation(() => backupService.create())
  const { mutate: deleteBackup } = useMutation((f: string) => backupService.delete(f))
  const { mutate: restoreBackup } = useMutation((f: string) => backupService.restore(f))
  const toast = useToast()

  const handleCreate = async () => {
    const res = await createBackup(undefined as any)
    if (res) { toast.show(t('backup.backupCreated'), 'success'); refetchBackups(); refetchLogs() }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(t('backup.confirmDelete', { filename }))) return
    const res = await deleteBackup(filename)
    if (res) { toast.show(t('backup.deleted'), 'success'); refetchBackups(); refetchLogs() }
  }

  const handleRestore = async (filename: string) => {
    if (!confirm(t('backup.confirmRestore', { filename }))) return
    const res = await restoreBackup(filename)
    if (res) { toast.show(t('backup.restored'), 'success'); refetchBackups(); refetchLogs() }
  }

  const actionColor: Record<string, string> = { create: 'green', restore: 'blue', delete: 'red', cleanup: 'yellow' }

  const backupColumns = [
    { key: 'filename', header: t('backup.filename'), render: (b: BackupFile) => <code style={{ fontSize: '0.8rem' }}>{b.filename}</code> },
    { key: 'size', header: t('backup.size'), render: (b: BackupFile) => backupService.formatSize(b.size) },
    { key: 'created_at', header: t('backup.created') },
    { key: 'created_by', header: t('backup.by'), render: (b: BackupFile) => b.created_by || '-' },
    {
      key: 'actions', header: t('common.actions'),
      render: (b: BackupFile) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href={backupService.downloadUrl(b.filename)} style={{
            padding: '0.2rem 0.5rem', background: '#3b82f6', color: '#fff', borderRadius: '4px', fontSize: '0.75rem',
          }}>{t('backup.download')}</a>
          <Button size="sm" variant="warning" onClick={() => handleRestore(b.filename)}>{t('backup.restore')}</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(b.filename)}>{t('backup.delete')}</Button>
        </div>
      ),
    },
  ]

  const logColumns = [
    { key: 'id', header: '#', width: '50px' },
    { key: 'action', header: t('backup.action'), render: (l: BackupLog) => <Badge color={actionColor[l.action] || 'gray'}>{l.action}</Badge> },
    { key: 'filename', header: t('backup.file'), render: (l: BackupLog) => <code style={{ fontSize: '0.75rem' }}>{l.filename}</code> },
    { key: 'size', header: t('backup.size'), render: (l: BackupLog) => backupService.formatSize(l.size) },
    { key: 'status', header: t('common.status'), render: (l: BackupLog) => <Badge color={l.status === 'success' ? 'green' : 'red'}>{l.status}</Badge> },
    { key: 'created_by_user', header: t('backup.by') },
    { key: 'created_at', header: t('backup.time') },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>{t('backup.title')}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant={tab === 'files' ? 'primary' : 'ghost'} onClick={() => setTab('files')}>{t('backup.backups')}</Button>
          <Button variant={tab === 'logs' ? 'primary' : 'ghost'} onClick={() => setTab('logs')}>{t('backup.history')}</Button>
        </div>
      </div>

      {tab === 'files' && (
        <>
          <Button onClick={handleCreate} loading={creating} variant="success" style={{ marginBottom: '1rem' }}>{t('backup.createBackup')}</Button>
          <Card>
            <Table columns={backupColumns} data={backups || []} rowKey="filename" loading={loading} emptyText={t('backup.noBackups')} />
          </Card>
        </>
      )}

      {tab === 'logs' && (
        <Card>
          <Table columns={logColumns} data={logs || []} rowKey="id" loading={loading} emptyText={t('backup.noHistory')} />
        </Card>
      )}
    </div>
  )
}
