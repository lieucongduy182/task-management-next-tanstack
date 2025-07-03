import { queryKeys } from '@/lib/queryClient'
import { useSocket } from '@/lib/socket-context'
import { CreateTaskData } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string
  // Include workSpaceId to identify the workspace for the task
  workSpaceId: string
}

export const useRealtimeTaskMutation = () => {
  const queryClient = useQueryClient()
  const { socket } = useSocket()

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      const response = await api.post('/tasks', taskData)
      const newTask = response.data as CreateTaskData
      return newTask
    },
    onSuccess: (newTask, variables: any) => {
      if (socket) {
        socket.emit('task-created', {
          workspaceId: variables.workSpaceId,
          task: newTask,
        })
      }

      queryClient.invalidateQueries({
        queryKey: [queryKeys.tasks, variables.workSpaceId],
      })
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: async ({ workSpaceId, ...updates }: UpdateTaskData) => {
      const response = await api.put(`/tasks/${updates.id}`, updates)
      const updatedTask = response.data as CreateTaskData
      return updatedTask
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: [queryKeys.tasks, data.workSpaceId],
      })

      const previousTasks = queryClient.getQueryData<UpdateTaskData[]>([
        queryKeys.tasks,
        data.workSpaceId,
      ])

      queryClient.setQueryData<UpdateTaskData[]>(
        [queryKeys.tasks, data.workSpaceId],
        (oldTasks) =>
          oldTasks?.map((task) =>
            task.id === data.id ? { ...task, ...data } : task,
          ) ?? [],
      )

      return { previousTasks }
    },
    onSuccess: (updatedTask, variables) => {
      if (socket) {
        socket.emit('task-updated', {
          workspaceId: variables.workSpaceId,
          task: updatedTask,
        })
      }
    },
    onError: (error, variables, context) => {
      // rollback to previous tasks in case of error
      if (context?.previousTasks) {
        queryClient.setQueryData(
          [queryKeys.tasks, variables.workSpaceId],
          context.previousTasks,
        )
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.tasks, variables.workSpaceId],
      })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async ({
      id,
      workSpaceId,
    }: {
      id: string
      workSpaceId: string
    }) => {
      const response = await api.delete(`/tasks/${id}`)
      if (!response.data.success) {
        throw new Error('Failed to delete task')
      }
      return { id, workSpaceId }
    },

    onSuccess: (data) => {
      if (socket) {
        socket.emit('task-deleted', {
          workspaceId: data.workSpaceId,
          taskId: data.id,
        })
      }
    },
  })

  return {
    createRealtimeTask: createTaskMutation.mutate,
    updateRealtimeTask: updateTaskMutation.mutate,
    deleteRealtimeTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  }
}
