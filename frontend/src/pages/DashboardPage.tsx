import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Card, Badge } from '@/components/ui'

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <Card title={t('dashboard.accountInfo')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><strong>{t('dashboard.username')}:</strong> {user?.username}</div>
          <div><strong>{t('dashboard.email')}:</strong> {user?.email}</div>
          <div><strong>{t('dashboard.role')}:</strong> <Badge color="blue">{user?.role?.name}</Badge></div>
          <div><strong>{t('dashboard.status')}:</strong> <Badge color={user?.is_active ? 'green' : 'red'}>{user?.is_active ? t('common.active') : t('common.inactive')}</Badge></div>
          <div><strong>{t('dashboard.owner')}:</strong> {user?.is_owner ? '⭐ Yes' : 'No'}</div>
          <div><strong>{t('dashboard.since')}:</strong> {user?.created_at?.slice(0, 10)}</div>
        </div>
      </Card>

      {user?.role?.permissions && user.role.permissions.length > 0 && (
        <Card title={t('dashboard.permissions')}>
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
