import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) {
          return false
        }

        return failureCount < 3
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) {
          return false
        }

        return failureCount < 2
      },
    },
  },
})

export const queryKeys = {
  tasks: ['tasks'] as const,
  userTasks: (userId: string) => ['task', 'user', userId] as const,
  task: (id: string) => ['task', id] as const,
  users: ['users'] as const,
} as const
