// src/components/TaskList.tsx
import React, { useState } from 'react'
import { Task } from '@/types'
import { useTasks } from '@/hooks/useTasks'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { TaskForm } from './TaskForm'
import { TaskFormData } from '@/lib/validation'

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  const { updateTask, deleteTask, isUpdating, isDeleting } = useTasks()
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const handleEdit = (task: Task) => {
    setEditingTask(task)
  }

  const handleEditSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTask({ id: editingTask.id, ...data })
      setEditingTask(null)
    }
  }

  const handleDelete = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId)
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'todo':
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!tasks.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tasks yet. Create your first task!</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {task.title}
              </h3>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(task)}
                  disabled={isUpdating}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(task.id)}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              </div>
            </div>

            <p className="text-gray-600 mb-3">{task.description}</p>

            <div className="flex space-x-2">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  task.status,
                )}`}
              >
                {task.status.replace('-', ' ')}
              </span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                  task.priority,
                )}`}
              >
                {task.priority} priority
              </span>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Created: {new Date(task.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm
            onSubmit={handleEditSubmit}
            initialData={editingTask}
            loading={isUpdating}
          />
        )}
      </Modal>
    </>
  )
}
