import { useState } from 'react'
import { backupService } from '@/services'
import { Button, Card, Badge, Table } from '@/components/ui'
import { useApi, useMutation } from '@/hooks'
import { useToast } from '@/components/ui'
import type { BackupFile, BackupLog } from '@/types'

export default function BackupPage() {
  const [tab, setTab] = useState<'files' | 'logs'>('files')
  const { data: backups, loading, refetch: refetchBackups } = useApi(() => backupService.list())
  const { data: logs, refetch: refetchLogs } = useApi(() => backupService.logs())
  const { mutate: createBackup, loading: creating } = useMutation(() => backupService.create())
  const { mutate: deleteBackup } = useMutation((f: string) => backupService.delete(f))
  const { mutate: restoreBackup } = useMutation((f: string) => backupService.restore(f))
  const toast = useToast()

  const handleCreate = async () => {
    const res = await createBackup(undefined as any)
    if (res) { toast.show('Backup created', 'success'); refetchBackups(); refetchLogs() }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete ${filename}?`)) return
    const res = await deleteBackup(filename)
    if (res) { toast.show('Deleted', 'success'); refetchBackups(); refetchLogs() }
  }

  const handleRestore = async (filename: string) => {
    if (!confirm(`Restore from ${filename}?`)) return
    const res = await restoreBackup(filename)
    if (res) { toast.show('Restored', 'success'); refetchBackups(); refetchLogs() }
  }

  const actionColor: Record<string, string> = { create: 'green', restore: 'blue', delete: 'red', cleanup: 'yellow' }

  const backupColumns = [
    { key: 'filename', header: 'Filename', render: (b: BackupFile) => <code style={{ fontSize: '0.8rem' }}>{b.filename}</code> },
    { key: 'size', header: 'Size', render: (b: BackupFile) => backupService.formatSize(b.size) },
    { key: 'created_at', header: 'Created' },
    { key: 'created_by', header: 'By', render: (b: BackupFile) => b.created_by || '-' },
    {
      key: 'actions', header: 'Actions',
      render: (b: BackupFile) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href={backupService.downloadUrl(b.filename)} style={{
            padding: '0.2rem 0.5rem', background: '#3b82f6', color: '#fff', borderRadius: '4px', fontSize: '0.75rem',
          }}>Download</a>
          <Button size="sm" variant="warning" onClick={() => handleRestore(b.filename)}>Restore</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(b.filename)}>Delete</Button>
        </div>
      ),
    },
  ]

  const logColumns = [
    { key: 'id', header: '#', width: '50px' },
    { key: 'action', header: 'Action', render: (l: BackupLog) => <Badge color={actionColor[l.action] || 'gray'}>{l.action}</Badge> },
    { key: 'filename', header: 'File', render: (l: BackupLog) => <code style={{ fontSize: '0.75rem' }}>{l.filename}</code> },
    { key: 'size', header: 'Size', render: (l: BackupLog) => backupService.formatSize(l.size) },
    { key: 'status', header: 'Status', render: (l: BackupLog) => <Badge color={l.status === 'success' ? 'green' : 'red'}>{l.status}</Badge> },
    { key: 'created_by_user', header: 'By' },
    { key: 'created_at', header: 'Time' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Backup Management</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant={tab === 'files' ? 'primary' : 'ghost'} onClick={() => setTab('files')}>Backups</Button>
          <Button variant={tab === 'logs' ? 'primary' : 'ghost'} onClick={() => setTab('logs')}>History</Button>
        </div>
      </div>

      {tab === 'files' && (
        <>
          <Button onClick={handleCreate} loading={creating} variant="success" style={{ marginBottom: '1rem' }}>Create Backup</Button>
          <Card>
            <Table columns={backupColumns} data={backups || []} rowKey="filename" loading={loading} emptyText="No backups" />
          </Card>
        </>
      )}

      {tab === 'logs' && (
        <Card>
          <Table columns={logColumns} data={logs || []} rowKey="id" loading={loading} emptyText="No history" />
        </Card>
      )}
    </div>
  )
}
