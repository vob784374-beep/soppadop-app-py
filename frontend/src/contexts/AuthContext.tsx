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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
