'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { Navigation } from '@/components/Navigation'
import { TaskForm } from '@/components/TaskForm'
import { TaskList } from '@/components/TaskList'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TaskFormData } from '@/lib/validation'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { tasks, isLoading, createTask, isCreating } = useTasks()
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleCreateTask = (data: TaskFormData) => {
    createTask(data, {
      onSuccess: () => {
        setShowCreateModal(false)
      },
    })
  }

  const filterTasks = (status: string) => {
    if (status === 'all') return tasks

    return tasks.filter((task: TaskFormData) => task?.status === status)
  }

  const [filter, setFilter] = useState('all')
  const filteredTasks = filterTasks(filter)

  if (!isAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Task
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2 mb-6">
            {['all', 'todo', 'in-progress', 'completed'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'primary' : 'secondary'}
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'All' : status.replace('-', ' ')}
                {status !== 'all' && (
                  <span className="ml-1">
                    ({tasks.filter((t) => t?.status === status).length})
                  </span>
                )}
                {status === 'all' && (
                  <span className="ml-1">({tasks.length})</span>
                )}
              </Button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tasks...</p>
            </div>
          ) : (
            <TaskList tasks={filteredTasks} />
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
      >
        <TaskForm onSubmit={handleCreateTask} loading={isCreating} />
      </Modal>
    </div>
  )
}
