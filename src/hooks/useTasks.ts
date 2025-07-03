import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Task, UpdateTaskData } from '@/types'
import { queryKeys } from '@/lib/queryClient'
import { TaskFormData } from '@/lib/validation'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function useTasks() {
  const queryClient = useQueryClient()

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: async () => {
      try {
        const response = await api.get('/tasks')

        return response.data ?? []
      } catch (error) {
        console.error('❌ Error fetching tasks:', error)
        throw error
      }
    },
    enabled: !!Cookies.get('token'),
  })

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: TaskFormData) => {
      const response = await api.post('/tasks', taskData)
      return response.data as Task
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData(queryKeys.tasks, (oldTasks: Task[] = []) => [
        ...oldTasks,
        newTask,
      ])
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTaskData) => {
      const response = await api.put(`/tasks/${id}`, updates)
      return response.data as Task
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(queryKeys.tasks, (oldTasks: Task[] = []) =>
        oldTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        ),
      )
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/tasks/${taskId}`)
      return taskId
    },
    onSuccess: (taskId) => {
      queryClient.setQueryData(queryKeys.tasks, (oldTasks: Task[] = []) =>
        oldTasks.filter((task) => task.id !== taskId),
      )
    },
  })

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,

    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,

    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,

    refetch: tasksQuery.refetch,
  }
}
