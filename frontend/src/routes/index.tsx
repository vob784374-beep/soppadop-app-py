import { RouteObject, Navigate } from 'react-router-dom'
import { PrivateRoute, PublicRoute, RoleRoute, OwnerRoute } from './middleware'
import { MainLayout } from '@/components/layout'

import LoginPage from '@/pages/LoginPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import ProfilePage from '@/pages/ProfilePage'
import RegisterPage from '@/pages/RegisterPage'
import UsersPage from '@/pages/UsersPage'
import RolesPage from '@/pages/RolesPage'
import BackupPage from '@/pages/BackupPage'
import ApiDocsPage from '@/pages/ApiDocsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const publicRoutes: RouteObject[] = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <PublicRoute><LoginPage /></PublicRoute> },
  { path: '/reset-password', element: <PublicRoute><ResetPasswordPage /></PublicRoute> },
]

export const protectedRoutes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      { path: '/dashboard', element: <PrivateRoute><DashboardPage /></PrivateRoute> },
      { path: '/profile', element: <PrivateRoute><ProfilePage /></PrivateRoute> },
      { path: '/register', element: <OwnerRoute><RegisterPage /></OwnerRoute> },
      { path: '/users', element: <RoleRoute roles={['admin', 'manager']}><UsersPage /></RoleRoute> },
      { path: '/roles', element: <RoleRoute roles={['admin', 'manager']}><RolesPage /></RoleRoute> },
      { path: '/backup', element: <OwnerRoute><BackupPage /></OwnerRoute> },
      { path: '/api-docs', element: <OwnerRoute><ApiDocsPage /></OwnerRoute> },
    ],
  },
]

export const fallbackRoute: RouteObject = { path: '*', element: <NotFoundPage /> }
