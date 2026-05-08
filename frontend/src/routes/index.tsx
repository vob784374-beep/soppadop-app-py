import { RouteObject, Navigate } from 'react-router-dom'
import { PrivateRoute, PublicRoute, RoleRoute, OwnerRoute } from './middleware'
import { EditorialLayout } from '@/components/layout'

import LoginPage from '@/pages/LoginPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import ProfilePage from '@/pages/ProfilePage'
import RegisterPage from '@/pages/RegisterPage'
import UsersPage from '@/pages/UsersPage'
import RolesPage from '@/pages/RolesPage'
import BackupPage from '@/pages/BackupPage'
import ResourcesPage from '@/pages/ResourcesPage'
import PublicPage from '@/pages/PublicPage'
import PageAdminPage from '@/pages/PageAdminPage'
import ApiDocsPage from '@/pages/ApiDocsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import AbacPage from '@/pages/AbacPage'

export const publicRoutes: RouteObject[] = [
  { path: '/', element: <PublicPage /> },
  { path: '/page', element: <Navigate to="/" replace /> },
  { path: '/admin', element: <Navigate to="/admin/login" replace /> },
  { path: '/admin/login', element: <PublicRoute><LoginPage /></PublicRoute> },
  { path: '/admin/reset-password', element: <PublicRoute><ResetPasswordPage /></PublicRoute> },
]

export const protectedRoutes: RouteObject[] = [
  {
    element: <EditorialLayout />,
    children: [
      { path: '/admin/dashboard', element: <PrivateRoute><DashboardPage /></PrivateRoute> },
      { path: '/admin/profile', element: <PrivateRoute><ProfilePage /></PrivateRoute> },
      { path: '/admin/register', element: <OwnerRoute><RegisterPage /></OwnerRoute> },
      { path: '/admin/users', element: <RoleRoute roles={['admin', 'manager']}><UsersPage /></RoleRoute> },
      { path: '/admin/roles', element: <RoleRoute roles={['admin', 'manager']}><RolesPage /></RoleRoute> },
      { path: '/admin/resources', element: <PrivateRoute><ResourcesPage /></PrivateRoute> },
      { path: '/admin/page-admin', element: <PrivateRoute><PageAdminPage /></PrivateRoute> },
      { path: '/admin/backup', element: <OwnerRoute><BackupPage /></OwnerRoute> },
      { path: '/admin/api-docs', element: <OwnerRoute><ApiDocsPage /></OwnerRoute> },
      { path: '/admin/abac', element: <RoleRoute roles={['admin', 'manager']}><AbacPage /></RoleRoute> },
    ],
  },
]

export const fallbackRoute: RouteObject = { path: '*', element: <NotFoundPage /> }