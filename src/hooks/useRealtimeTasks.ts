import { queryClient } from '@/lib/queryClient'
import { useSocket } from '@/lib/socket-context'
import { Task, TaskUpdateEvent } from '@/types'
import { useEffect } from 'react'

export const useRealtimeTasks = (workSpaceId: string) => {
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    if (!socket || !isConnected || !workSpaceId) return

    // join workspace room
    socket.emit('join-workspace', workSpaceId)

    const handleTaskUpdate = (event: TaskUpdateEvent) => {
      const tasksQueryKey = ['tasks', workSpaceId]

      switch (event.type) {
        case 'TASK_CREATED':
          if (event.task) {
            queryClient.setQueryData(tasksQueryKey, (oldTasks: Task[] | []) => [
              ...oldTasks,
              event.task,
            ])
          }
          break
        case 'TASK_UPDATED':
          if (event.task) {
            queryClient.setQueryData<Task[]>(tasksQueryKey, (oldTasks) => {
              if (!oldTasks) return []

              return oldTasks.map((task) =>
                task.id === event?.task?.id ? event.task : task,
              )
            })
          }
          break
        case 'TASK_DELETED':
          if (event.taskId) {
            queryClient.setQueryData<Task[]>(tasksQueryKey, (oldTasks) => {
              if (!oldTasks) return []

              return oldTasks.filter((task) => task.id !== event.taskId)
            })
          }
          break
      }
    }

    socket.on('task-updated', handleTaskUpdate)

    return () => {
      socket.off('task-updated', handleTaskUpdate)
    }
  }, [socket, isConnected, workSpaceId, queryClient])
}
