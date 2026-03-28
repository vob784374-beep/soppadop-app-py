import { useAuth } from '@/contexts/AuthContext'
import { Card, Badge } from '@/components/ui'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1>Dashboard</h1>
      <Card title="Account Info">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><strong>Username:</strong> {user?.username}</div>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Role:</strong> <Badge color="blue">{user?.role?.name}</Badge></div>
          <div><strong>Status:</strong> <Badge color={user?.is_active ? 'green' : 'red'}>{user?.is_active ? 'Active' : 'Inactive'}</Badge></div>
          <div><strong>Owner:</strong> {user?.is_owner ? '⭐ Yes' : 'No'}</div>
          <div><strong>Since:</strong> {user?.created_at?.slice(0, 10)}</div>
        </div>
      </Card>

      {user?.role?.permissions && user.role.permissions.length > 0 && (
        <Card title="Permissions">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {user.role.permissions.map(p => (
              <Badge key={p.id} color="purple">{p.name}</Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
