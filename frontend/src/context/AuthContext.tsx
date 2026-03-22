import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import axios, { AxiosError } from 'axios'
import api from '../api/axios'
import type { AuthContextType, AuthMeResponse, AuthResponse, User } from '../types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_STORAGE_KEY = 'token'

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>
    return (
      axiosError.response?.data?.error ??
      axiosError.response?.data?.message ??
      'Request failed. Please try again.'
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred.'
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [isLoading, setIsLoading] = useState(true)

  const persistAuth = (nextToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
    setToken(nextToken)
    setUser(nextUser)
  }

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
      persistAuth(data.token, data.user)
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password })
      persistAuth(data.token, data.user)
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  }

  const logout = () => {
    clearAuth()
  }

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        const { data } = await api.get<AuthMeResponse>('/auth/me')
        persistAuth(storedToken, data.user)
      } catch {
        clearAuth()
      } finally {
        setIsLoading(false)
      }
    }

    void checkAuth()
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
