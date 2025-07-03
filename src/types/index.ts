export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  userId: string
  createdAt: string
  updatedAt: string
}

export interface TaskUpdateEvent {
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED'
  task?: Task
  taskId?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface CreateTaskData {
  title: string
  description: string
  status: Task['status']
  priority: Task['priority']
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string
}
