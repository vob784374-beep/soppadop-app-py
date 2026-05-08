import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/services'
import type { User, LoginRequest, RegisterRequest } from '@/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (...permissions: string[]) => boolean
  hasAttribute: (key: string, value?: string) => boolean
  canAccess?: (check: {
    action: string
    resource: string
    resourceId?: number
    context?: Record<string, unknown>
  }) => Promise<boolean>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    const init = async () => {
      const u = await authService.getCurrentUser()
      setUser(u)
      setIsLoading(false)
    }
    init()
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const u = await authService.login(data)
    setUser(u)
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    await authService.register(data)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const u = await authService.getCurrentUser()
    setUser(u)
  }, [])

  const hasPermission = (permission: string) => {
    if (!user) return false
    if (user.role.is_super_admin) return true
    return user.role.permissions.some(p => p.name === permission)
  }

  const hasAnyPermission = (...permissions: string[]) => {
    if (!user) return false
    if (user.role.is_super_admin) return true
    const userPerms = new Set(user.role.permissions.map(p => p.name))
    return permissions.some(p => userPerms.has(p))
  }

  const hasAttribute = (key: string, value?: string) => {
    if (!user || !user.attributes) return false
    const attrValue = user.attributes[key]
    if (attrValue === undefined) return false
    return value === undefined || attrValue === value
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      register, 
      logout, 
      refreshUser,
      hasPermission,
      hasAnyPermission,
      hasAttribute
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}