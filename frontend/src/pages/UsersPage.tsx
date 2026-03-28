import { authService } from '@/services'
import { Button, Card, Badge, Table, Alert } from '@/components/ui'
import { useApi, useMutation } from '@/hooks'
import { useToast } from '@/components/ui'
import type { User } from '@/types'

export default function UsersPage() {
  const { data, loading, error, refetch } = useApi(() => authService.getUsers())
  const { mutate: deleteUser } = useMutation((id: number) => authService.deleteUser(id))
  const { mutate: toggleUser } = useMutation((u: User) => authService.updateUser(u.id, { is_active: !u.is_active }))
  const toast = useToast()

  const handleDelete = async (u: User) => {
    if (!confirm(`Delete "${u.username}"?`)) return
    const res = await deleteUser(u.id)
    if (res) { toast.show('User deleted', 'success'); refetch() }
  }

  const handleToggle = async (u: User) => {
    const res = await toggleUser(u)
    if (res) { toast.show('User updated', 'success'); refetch() }
  }

  const columns = [
    { key: 'id', header: 'ID', width: '60px' },
    { key: 'username', header: 'Username', render: (u: User) => <>{u.username} {u.is_owner && '⭐'}</> },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (u: User) => <Badge color={u.role?.is_super_admin ? 'yellow' : 'blue'}>{u.role?.name}</Badge> },
    { key: 'status', header: 'Status', render: (u: User) => <Badge color={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions', header: 'Actions',
      render: (u: User) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="sm" variant={u.is_active ? 'warning' : 'success'} onClick={() => handleToggle(u)}>
            {u.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          {!u.is_owner && <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>Delete</Button>}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Users ({data?.total || 0})</h1>
        <Button onClick={refetch}>Refresh</Button>
      </div>
      {error && <Alert type="error" message={error} />}
      <Card>
        <Table columns={columns} data={data?.users || []} rowKey="id" loading={loading} emptyText="No users found" />
      </Card>
    </div>
  )
}
