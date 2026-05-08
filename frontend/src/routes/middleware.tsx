import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { PermissionCheck } from '@/types'

export function PrivateRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function RoleRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const userRole = user.role?.name
  const isAllowed = userRole && allowedRoles.includes(userRole)
  
  // Owner/super_admin bypass all role checks
  if (user.is_owner || userRole === 'super_admin') {
    return <Outlet />
  }

  // Admin bypass most role checks (except owner-only)
  if (userRole === 'admin' && !allowedRoles.includes('owner')) {
    return <Outlet />
  }

  if (!isAllowed) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Outlet />
}

export function OwnerRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user.is_owner && user.role?.name !== 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Outlet />
}

export function PermissionRoute({ 
  permissions, 
  abacCheck 
}: { 
  permissions?: string[]
  abacCheck?: PermissionCheck
}) {
  const { user, isLoading, hasAnyPermission } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Owner/super_admin bypass all permission checks
  if (user.is_owner || user.role?.is_super_admin) {
    return <Outlet />
  }

  // Admin bypass most permission checks
  if (user.role?.name === 'admin') {
    return <Outlet />
  }

  // Check RBAC permissions
  if (permissions && !hasAnyPermission(...permissions)) {
    return <Navigate to="/admin/dashboard" replace />
  }

  // TODO: Add ABAC check via API call when abacCheck is provided
  // For now, rely on backend to enforce ABAC policies

  return <Outlet />
}