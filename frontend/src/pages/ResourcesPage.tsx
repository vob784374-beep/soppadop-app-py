import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { resourceService } from '@/services'
import { Button, Card, Badge, Table, Modal, Input } from '@/components/ui'
import { useApi, useMutation } from '@/hooks'
import { useToast } from '@/components/ui'
import type { Resource } from '@/types'

type FileTypeFilter = 'all' | 'image' | 'video' | 'document' | 'archive' | 'other'

export default function ResourcesPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [page, setPage] = useState(1)
  const [fileType, setFileType] = useState<FileTypeFilter>('all')
  const [search, setSearch] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploadFolder, setUploadFolder] = useState('')
  const [uploadCollection, setUploadCollection] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Create folder modal
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  // Edit modal
  const [showEditModal, setShowEditModal] = useState<Resource | null>(null)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCollection, setEditCollection] = useState('')

  const params = {
    page, per_page: 20,
    ...(fileType !== 'all' && { file_type: fileType }),
    ...(selectedFolder && { folder: selectedFolder }),
    ...(selectedCollection && { collection: selectedCollection }),
    ...(search && { search }),
  }

  const { data, loading } = useApi(() => resourceService.list(params), [page, fileType, selectedFolder, selectedCollection, search, refreshKey])
  const { data: stats } = useApi(() => resourceService.stats(), [refreshKey])
  const { data: account } = useApi(() => resourceService.account(), [refreshKey])
  const { data: cloudFolders } = useApi(() => resourceService.cloudinaryFolders('soppadop'), [refreshKey])
  const { data: dbCollections } = useApi(() => resourceService.collections(), [refreshKey])

  const { mutate: deleteResource } = useMutation((id: number) => resourceService.delete(id))
  const { mutate: updateResourceMut } = useMutation(
    (p: { id: number; data: Partial<Resource> }) => resourceService.update(p.id, p.data)
  )
  const { mutate: createFolderMut } = useMutation((path: string) => resourceService.createFolder(path))

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setPendingFiles(Array.from(files))
    setUploadFolder(selectedFolder)
    setUploadCollection(selectedCollection)
    setShowUploadModal(true)
    e.target.value = ''
  }, [selectedFolder, selectedCollection])

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return
    setIsUploading(true)
    let ok = 0, fail = 0

    for (const file of pendingFiles) {
      try {
        await resourceService.upload(file, {
          collection: uploadCollection || 'default',
          folder: uploadFolder || 'general',
        })
        ok++
      } catch (err: any) {
        fail++
        console.error('UPLOAD FAIL:', err?.response?.data || err?.message)
      }
    }

    setIsUploading(false)
    setShowUploadModal(false)
    setPendingFiles([])

    if (ok > 0) toast.show(`Uploaded ${ok} file(s)`, 'success')
    if (fail > 0) toast.show(`${fail} file(s) failed`, 'error')
    setRefreshKey(k => k + 1)
  }

  const handleDelete = async (resource: Resource) => {
    if (!confirm(t('resources.confirmDelete', { name: resource.original_name }))) return
    await deleteResource(resource.id)
    toast.show(t('resources.deleted'), 'success')
    setRefreshKey(k => k + 1)
  }

  const handleDownload = async (resource: Resource) => {
    try {
      const url = await resourceService.getDownloadUrl(resource.id)
      window.open(url, '_blank')
    } catch { toast.show(t('resources.downloadFailed'), 'error') }
  }

  const handleEdit = async () => {
    if (!showEditModal) return
    const d: Partial<Resource> = {}
    if (editDisplayName.trim()) d.display_name = editDisplayName.trim()
    if (editDescription !== (showEditModal.description || '')) d.description = editDescription
    if (editCollection !== (showEditModal.collection || '')) d.collection = editCollection
    await updateResourceMut({ id: showEditModal.id, data: d })
    toast.show(t('resources.updated'), 'success')
    setShowEditModal(null)
    setRefreshKey(k => k + 1)
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    await createFolderMut(`soppadop/${newFolderName.trim()}`)
    toast.show(t('resources.folderCreated'), 'success')
    setNewFolderName('')
    setShowCreateFolderModal(false)
    setRefreshKey(k => k + 1)
  }

  const fileTypeFilters: { key: FileTypeFilter; label: string }[] = [
    { key: 'all', label: t('resources.all') },
    { key: 'image', label: t('resources.images') },
    { key: 'video', label: t('resources.videos') },
    { key: 'document', label: t('resources.documents') },
    { key: 'archive', label: t('resources.archives') },
    { key: 'other', label: t('resources.other') },
  ]

  const columns = [
    {
      key: 'type', header: t('resources.type'), width: '60px',
      render: (r: Resource) => <Badge color={resourceService.getFileTypeColor(r.file_type)}>{resourceService.getFileIcon(r.file_type)}</Badge>,
    },
    {
      key: 'name', header: t('resources.name'),
      render: (r: Resource) => (
        <div>
          <div style={{ fontWeight: 500, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.display_name || r.original_name}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
            {r.original_name}{r.format ? ` .${r.format}` : ''}{r.width && r.height ? ` · ${r.width}x${r.height}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'folder', header: t('resources.folder'), width: '120px',
      render: (r: Resource) => <Badge color="gray">{r.folder}</Badge>,
    },
    {
      key: 'collection', header: t('resources.collection'), width: '110px',
      render: (r: Resource) => r.collection && r.collection !== 'default'
        ? <Badge color="purple">{r.collection}</Badge>
        : <span style={{ color: '#9ca3af' }}>-</span>,
    },
    { key: 'size', header: t('resources.size'), render: (r: Resource) => resourceService.formatSize(r.size), width: '90px' },
    { key: 'download_count', header: t('resources.downloads'), width: '80px' },
    {
      key: 'actions', header: t('common.actions'), width: '200px',
      render: (r: Resource) => (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <Button size="sm" variant="primary" onClick={() => handleDownload(r)}>{t('resources.download')}</Button>
          <Button size="sm" variant="ghost" onClick={() => {
            setShowEditModal(r); setEditDisplayName(r.display_name || r.original_name)
            setEditDescription(r.description || ''); setEditCollection(r.collection || '')
          }}>{t('common.edit')}</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(r)}>{t('common.delete')}</Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>{t('resources.title')}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" onClick={() => setShowCreateFolderModal(true)}>{t('resources.newFolder')}</Button>
          <Button variant="success" onClick={() => fileInputRef.current?.click()}>{t('resources.upload')}</Button>
          <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
        </div>
      </div>

      {stats && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <Card style={{ flex: '1 1 120px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{t('resources.totalFiles')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total_files}</div>
          </Card>
          <Card style={{ flex: '1 1 120px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{t('resources.totalSize')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{resourceService.formatSize(stats.total_size)}</div>
          </Card>
        </div>
      )}

      {account && (
        <Card style={{ padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280' }}>{t('resources.cloudinaryPlan')}: </span>
              <Badge color="blue">{account.plan}</Badge>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.5rem' }}>({account.cloud_name})</span>
            </div>
            <a href="https://cloudinary.com/pricing" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none' }}>
              {t('resources.upgradePlan')} →
            </a>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
            <div style={{ flex: '1 1 150px' }}>
              <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{t('resources.storage')}</div>
              <div style={{ fontWeight: 600 }}>{resourceService.formatSize(account.storage.used_bytes)} / {resourceService.formatSize(account.storage.limit_bytes)}</div>
              <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '6px', marginTop: '0.25rem' }}>
                <div style={{ background: account.storage.used_percent > 80 ? '#ef4444' : '#3b82f6', borderRadius: '4px', height: '6px', width: `${Math.min(account.storage.used_percent, 100)}%` }} />
              </div>
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{t('resources.bandwidth')}</div>
              <div style={{ fontWeight: 600 }}>{resourceService.formatSize(account.bandwidth.used_bytes)} / {resourceService.formatSize(account.bandwidth.limit_bytes)}</div>
              <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '6px', marginTop: '0.25rem' }}>
                <div style={{ background: account.bandwidth.used_percent > 80 ? '#ef4444' : '#3b82f6', borderRadius: '4px', height: '6px', width: `${Math.min(account.bandwidth.used_percent, 100)}%` }} />
              </div>
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{t('resources.transformations')}</div>
              <div style={{ fontWeight: 600 }}>{account.transformations.used.toLocaleString()} / {account.transformations.limit.toLocaleString()}</div>
              <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '6px', marginTop: '0.25rem' }}>
                <div style={{ background: account.transformations.used_percent > 80 ? '#ef4444' : '#3b82f6', borderRadius: '4px', height: '6px', width: `${Math.min(account.transformations.used_percent, 100)}%` }} />
              </div>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Sidebar */}
        <div style={{ width: '220px', flexShrink: 0 }}>
          {/* Folders */}
          <Card style={{ padding: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{t('resources.folders')}</span>
              <Button size="sm" variant="ghost" onClick={() => setShowCreateFolderModal(true)} style={{ padding: '0.125rem 0.375rem', fontSize: '0.7rem' }}>+</Button>
            </div>
            <div onClick={() => { setSelectedFolder(''); setSelectedCollection('') }}
              style={{ padding: '0.375rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginBottom: '0.25rem', background: !selectedFolder && !selectedCollection ? '#eff6ff' : 'transparent', fontWeight: !selectedFolder && !selectedCollection ? 600 : 400, color: !selectedFolder && !selectedCollection ? '#1d4ed8' : '#374151' }}>
              {t('resources.allFolders')}
            </div>
            {(cloudFolders || []).map(f => (
              <div key={f.path} onClick={() => { setSelectedFolder(f.name); setSelectedCollection('') }}
                style={{ padding: '0.375rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginBottom: '0.25rem', background: selectedFolder === f.name ? '#eff6ff' : 'transparent', fontWeight: selectedFolder === f.name ? 600 : 400, color: selectedFolder === f.name ? '#1d4ed8' : '#374151' }}>
                {f.name}
              </div>
            ))}
          </Card>

          {/* Collections */}
          <Card style={{ padding: '0.75rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{t('resources.collections')}</span>
            </div>
            {(dbCollections || []).map((c: { name: string; count: number }) => (
              <div key={c.name} onClick={() => { setSelectedCollection(c.name); setSelectedFolder('') }}
                style={{ padding: '0.375rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginBottom: '0.25rem', background: selectedCollection === c.name ? '#f5f3ff' : 'transparent', fontWeight: selectedCollection === c.name ? 600 : 400, color: selectedCollection === c.name ? '#7c3aed' : '#374151', display: 'flex', justifyContent: 'space-between' }}>
                <span>{c.name}</span>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{c.count}</span>
              </div>
            ))}
            {(!dbCollections || dbCollections.length === 0) && (
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', padding: '0.25rem 0' }}>{t('resources.noCollections')}</div>
            )}
          </Card>
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {fileTypeFilters.map(f => (
              <Button key={f.key} size="sm" variant={fileType === f.key ? 'primary' : 'ghost'} onClick={() => { setFileType(f.key); setPage(1) }}>
                {f.label}
              </Button>
            ))}
            <input type="text" placeholder={t('resources.searchPlaceholder')} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ padding: '0.375rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.8rem', width: '200px', marginLeft: 'auto' }} />
          </div>

          <Card>
            <Table columns={columns} data={data?.resources || []} rowKey="id" loading={loading} emptyText={t('resources.noResources')} />
          </Card>

          {data && data.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('common.previous')}</Button>
              <span style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>{t('common.pageInfo', { page: data.page, pages: data.pages })}</span>
              <Button size="sm" variant="ghost" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>{t('common.next')}</Button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal open={showUploadModal} onClose={() => { setShowUploadModal(false); setPendingFiles([]) }} title={t('resources.uploadFiles')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>{t('resources.filesToUpload')}</label>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', maxHeight: '80px', overflow: 'auto' }}>
              {pendingFiles.map((f, i) => <div key={i}>{f.name} ({resourceService.formatSize(f.size)})</div>)}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>{t('resources.folder')}</label>
            <select value={uploadFolder} onChange={e => setUploadFolder(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem' }}>
              <option value="">-- {t('resources.selectFolder')} --</option>
              <option value="general">general</option>
              {(cloudFolders || []).map(f => <option key={f.path} value={f.name}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>{t('resources.collection')} ({t('resources.optional')})</label>
            <select value={uploadCollection} onChange={e => setUploadCollection(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem' }}>
              <option value="">-- {t('resources.noCollection')} --</option>
              {(dbCollections || []).map((c: { name: string }) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => { setShowUploadModal(false); setPendingFiles([]) }}>{t('common.cancel')}</Button>
            <Button variant="success" onClick={handleUpload} disabled={pendingFiles.length === 0 || !uploadFolder} loading={isUploading}>{t('resources.upload')}</Button>
          </div>
        </div>
      </Modal>

      {/* Create Folder Modal */}
      <Modal open={showCreateFolderModal} onClose={() => setShowCreateFolderModal(false)} title={t('resources.createFolder')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label={t('resources.folderName')} value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="my-folder" />
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>soppadop/{newFolderName || '...'}</div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowCreateFolderModal(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>{t('common.create')}</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!showEditModal} onClose={() => setShowEditModal(null)} title={t('resources.editResource')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{showEditModal?.original_name}</div>
          <Input label={t('resources.displayName')} value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)} />
          <Input label={t('resources.description')} value={editDescription} onChange={e => setEditDescription(e.target.value)} />
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>{t('resources.collection')}</label>
            <select value={editCollection} onChange={e => setEditCollection(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem' }}>
              <option value="">-- {t('resources.noCollection')} --</option>
              {(dbCollections || []).map((c: { name: string }) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowEditModal(null)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleEdit}>{t('common.save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
