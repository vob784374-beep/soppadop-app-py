import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export function RoleRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.is_owner) return <>{children}</>
  if (!roles.includes(user?.role?.name || '')) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user?.is_owner) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
