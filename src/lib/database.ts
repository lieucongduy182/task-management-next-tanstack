import { Task, User } from '@/types'
import fs from 'fs/promises'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DB_PATH, 'users.json')
const TASKS_FILE = path.join(DB_PATH, 'tasks.json')

export async function initDatabase() {
  try {
    await fs.access(DB_PATH)
  } catch {
    await fs.mkdir(DB_PATH, { recursive: true })
  }

  try {
    await fs.access(USERS_FILE)
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify([]))
  }

  try {
    await fs.access(TASKS_FILE)
  } catch {
    await fs.writeFile(TASKS_FILE, JSON.stringify([]))
  }
}

// User operations
export async function getUsers(): Promise<User[]> {
  await initDatabase()
  const data = await fs.readFile(USERS_FILE, 'utf-8')
  return JSON.parse(data)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers()
  return users.find((user) => user.email === email) || null
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers()
  return users.find((user) => user.id === id) || null
}

export async function createUser(
  userData: Omit<User, 'id' | 'createdAt'>,
): Promise<User> {
  const users = await getUsers()
  const newUser: User = {
    id: Date.now().toString(),
    ...userData,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
  return newUser
}

// Task operations
export async function getTasks(): Promise<Task[]> {
  await initDatabase()
  const data = await fs.readFile(TASKS_FILE, 'utf-8')
  return JSON.parse(data)
}

export async function getTasksByUserId(userId: string): Promise<Task[]> {
  const tasks = await getTasks()
  return tasks.filter((task) => task.userId === userId)
}

export async function getTaskById(id: string): Promise<Task | null> {
  const tasks = await getTasks()
  return tasks.find((task) => task.id === id) || null
}

export async function createTask(
  taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Task> {
  const tasks = await getTasks()
  const newTask: Task = {
    id: Date.now().toString(),
    ...taskData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  tasks.push(newTask)
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2))
  return newTask
}

export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<Task | null> {
  const tasks = await getTasks()
  const taskIndex = tasks.findIndex((task) => task.id === id)

  if (taskIndex === -1) return null

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2))
  return tasks[taskIndex]
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await getTasks()
  const taskIndex = tasks.findIndex((task) => task.id === id)

  if (taskIndex === -1) return false

  tasks.splice(taskIndex, 1)
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2))
  return true
}
