import { useTranslation } from 'react-i18next'
import { authService } from '@/services'
import { Button, Card, Badge, Table, Alert } from '@/components/ui'
import { useApi, useMutation } from '@/hooks'
import { useToast } from '@/components/ui'
import type { User } from '@/types'

export default function UsersPage() {
  const { t } = useTranslation()
  const { data, loading, error, refetch } = useApi(() => authService.getUsers())
  const { mutate: deleteUser } = useMutation((id: number) => authService.deleteUser(id))
  const { mutate: toggleUser } = useMutation((u: User) => authService.updateUser(u.id, { is_active: !u.is_active }))
  const toast = useToast()

  const handleDelete = async (u: User) => {
    if (!confirm(t('users.confirmDelete', { username: u.username }))) return
    const res = await deleteUser(u.id)
    if (res) { toast.show(t('users.userDeleted'), 'success'); refetch() }
  }

  const handleToggle = async (u: User) => {
    const res = await toggleUser(u)
    if (res) { toast.show(t('users.userUpdated'), 'success'); refetch() }
  }

  const columns = [
    { key: 'id', header: t('users.id'), width: '60px' },
    { key: 'username', header: t('users.username'), render: (u: User) => <>{u.username} {u.is_owner && '⭐'}</> },
    { key: 'email', header: t('users.email') },
    { key: 'role', header: t('users.role'), render: (u: User) => <Badge color={u.role?.is_super_admin ? 'yellow' : 'blue'}>{u.role?.name}</Badge> },
    { key: 'status', header: t('users.status'), render: (u: User) => <Badge color={u.is_active ? 'green' : 'red'}>{u.is_active ? t('common.active') : t('common.inactive')}</Badge> },
    {
      key: 'actions', header: t('common.actions'),
      render: (u: User) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="sm" variant={u.is_active ? 'warning' : 'success'} onClick={() => handleToggle(u)}>
            {u.is_active ? t('users.deactivate') : t('users.activate')}
          </Button>
          {!u.is_owner && <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>{t('users.delete')}</Button>}
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
    </div>
  )
}
