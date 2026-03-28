import { useRoutes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { publicRoutes, protectedRoutes, fallbackRoute } from '@/routes'

export default function App() {
  const { isLoading } = useAuth()
  const { t } = useTranslation()
  const element = useRoutes([...publicRoutes, ...protectedRoutes, fallbackRoute])

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p className="app-loading-text">{t('app.loading')}</p>
      </div>
    )
  }

  return <div className="page-enter">{element}</div>
}
