import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services'
import { Button, Card, Badge, Table, Alert, Modal, Input, Select } from '@/components/ui'
import { useApi, useMutation } from '@/hooks'
import { useToast } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { Zap, UserCheck } from '@/components/ui/Icons'
import { theme as T } from '@/styles/theme'
import type { User } from '@/types'

export default function UsersPage() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const { data, loading, error, refetch } = useApi(() => authService.getUsers())
  const { mutate: deleteUser } = useMutation((id: number) => authService.deleteUser(id))
  const { mutate: toggleUser } = useMutation((u: User) => authService.updateUser(u.id, { is_active: !u.is_active }))
  const { mutate: updateUserAttrs } = useMutation((p: { id: number; attributes: Record<string, string> }) =>
    authService.updateUser(p.id, { attributes: p.attributes })
  )
  const toast = useToast()
  const [revokeTarget, setRevokeTarget] = useState<User | null>(null)
  const [attrsTarget, setAttrsTarget] = useState<User | null>(null)
  const [revoking, setRevoking] = useState(false)
  const [editingAttrs, setEditingAttrs] = useState(false)
  const [attrForm, setAttrForm] = useState<Record<string, string>>({})

  const isOwner = currentUser?.is_owner

  const handleDelete = async (u: User) => {
    if (!confirm(t('users.confirmDelete', { username: u.username }))) return
    const res = await deleteUser(u.id)
    if (res) { toast.show(t('users.userDeleted'), 'success'); refetch() }
  }

  const handleToggle = async (u: User) => {
    const res = await toggleUser(u)
    if (res) { toast.show(t('users.userUpdated'), 'success'); refetch() }
  }

  const handleRevoke = async () => {
    if (!revokeTarget) return
    setRevoking(true)
    try {
      const res = await authService.revokeUserTokens(revokeTarget.id)
      toast.success(res.message)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to revoke tokens')
    }
    setRevoking(false)
    setRevokeTarget(null)
  }

  const handleAttrs = async (u: User) => {
    setAttrsTarget(u)
    setAttrForm(u.attributes || {})
    setEditingAttrs(true)
  }

  const handleSaveAttrs = async () => {
    if (!attrsTarget) return
    const res = await updateUserAttrs({ id: attrsTarget.id, attributes: attrForm })
    if (res) {
      toast.show(t('users.attributesUpdated'), 'success')
      setEditingAttrs(false)
      setAttrsTarget(null)
      refetch()
    }
  }

  const columns = [
    { key: 'id', header: t('users.id'), width: '60px' },
    { key: 'username', header: t('users.username'), render: (u: User) => <>{u.username} {u.is_owner && '⭐'}</> },
    { key: 'email', header: t('users.email') },
    {
      key: 'role', header: t('users.role'),
      render: (u: User) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <Badge color={u.role?.is_super_admin ? 'yellow' : 'blue'}>{u.role?.name}</Badge>
          {u.role?.is_super_admin && (
            <span style={{ fontSize: '0.55rem', color: T.rose, fontWeight: 500, textTransform: 'uppercase' }}>
              ABAC Bypass
            </span>
          )}
          {u.attributes && Object.keys(u.attributes).length > 0 && (
            <span style={{ fontSize: '0.55rem', color: '#8b5cf6', fontWeight: 500 }}>
              {Object.keys(u.attributes).length} ABAC attrs
            </span>
          )}
        </div>
      ),
    },
    { key: 'status', header: t('users.status'), render: (u: User) => <Badge color={u.is_active ? 'green' : 'red'}>{u.is_active ? t('common.active') : t('common.inactive')}</Badge> },
    {
      key: 'actions', header: t('common.actions'),
      render: (u: User) => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button size="sm" variant={u.is_active ? 'warning' : 'success'} onClick={() => handleToggle(u)}>
            {u.is_active ? t('users.deactivate') : t('users.activate')}
          </Button>
          {isOwner && !u.is_owner && u.id !== currentUser?.id && (
            <Button size="sm" variant="danger" onClick={() => setRevokeTarget(u)}>
              <Zap size={12} /> Revoke
            </Button>
          )}
          {isOwner && (
            <Button size="sm" variant="ghost" onClick={() => handleAttrs(u)} title="Edit Attributes">
              <UserCheck size={12} /> Attrs
            </Button>
          )}
          {!u.is_owner && <Button size="sm" variant="danger" onClick={() => handleDelete(u)}
            style={{ whiteSpace: 'nowrap' }}>{t('users.delete')}</Button>}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>{t('users.title')} ({data?.total || 0})</h1>
        <Button onClick={refetch}>{t('common.refresh')}</Button>
      </div>
      {error && <Alert type="error" message={error} />}
      <Card>
        <Table columns={columns} data={data?.users || []} rowKey="id" loading={loading} emptyText={t('users.noUsers')} />
      </Card>

      {/* Revoke Token Confirmation Modal */}
      <Modal open={!!revokeTarget} onClose={() => setRevokeTarget(null)} title="Revoke Token">
        <p style={{ margin: '0 0 1.25rem', color: T.muted, fontSize: '0.875rem' }}>
          Revoke all tokens for user <strong>{revokeTarget?.username}</strong> ({revokeTarget?.email})?
          They will be forced to log in again.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" onClick={() => setRevokeTarget(null)}>Cancel</Button>
          <Button variant="danger" size="sm" loading={revoking} onClick={handleRevoke}>
            <Zap size={14} /> Revoke
          </Button>
        </div>
      </Modal>

      {/* Attribute Editor Modal */}
      <Modal open={editingAttrs} onClose={() => setEditingAttrs(false)} title="Edit User Attributes (ABAC)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: T.muted }}>
            Key-value attributes used by ABAC policies. Empty values remove the attribute.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflow: 'auto' }}>
            {Object.entries(attrForm).map(([key, value], i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Input
                  style={{ flex: 1 }}
                  value={key}
                  onChange={e => {
                    const newForm = { ...attrForm };
                    delete newForm[key];
                    newForm[e.target.value] = value;
                    setAttrForm(newForm);
                  }}
                  placeholder="Attribute key"
                />
                <Input
                  style={{ flex: 2 }}
                  value={value}
                  onChange={e => setAttrForm({ ...attrForm, [key]: e.target.value })}
                  placeholder="Attribute value"
                />
                <Button variant="danger" size="sm" onClick={() => {
                  const newForm = { ...attrForm };
                  delete newForm[key];
                  setAttrForm(newForm);
                }}>Remove</Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setAttrForm({ ...attrForm, '': '' })}
              style={{ alignSelf: 'flex-start' }}>
              + Add Attribute
            </Button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setEditingAttrs(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveAttrs}>Save Attributes</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
