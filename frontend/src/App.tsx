import { useRoutes } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { publicRoutes, protectedRoutes, fallbackRoute } from '@/routes'

export default function App() {
  const { isLoading } = useAuth()
  const element = useRoutes([...publicRoutes, ...protectedRoutes, fallbackRoute])

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p className="app-loading-text">Loading...</p>
      </div>
    )
  }

  return <div className="page-enter">{element}</div>
}
