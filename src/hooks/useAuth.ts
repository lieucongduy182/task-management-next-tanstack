import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { queryKeys } from '../lib/queryClient'
import { LoginCredentials, RegisterCredentials, User } from '../types'
import { redirect } from 'next/navigation'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
})

export function useAuth() {
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post('/auth/login', credentials)
      return response.data
    },
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data.user))
      Cookies.set('token', data.token, { expires: 7 })

      queryClient.setQueryData(queryKeys.users, data.user)
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await api.post('/auth/register', credentials)
      return response.data
    },
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data.user))
      Cookies.set('token', data.token, { expires: 7 })
      queryClient.setQueryData(queryKeys.users, data.user)
    },
  })

  const logout = () => {
    localStorage.removeItem('user')
    Cookies.remove('token')
    queryClient.removeQueries({ queryKey: queryKeys.users })

    redirect('/login')
  }

  const getCurrentUser = (): User | null => {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  }

  const isAuthenticated = (): boolean => {
    return !!Cookies.get('token')
  }

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    getCurrentUser,
    isAuthenticated,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    error: loginMutation.error || registerMutation.error,
  }
}
