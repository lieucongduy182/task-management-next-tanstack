import { NextRequest, NextResponse } from 'next/server'
import { taskSchema } from '@/lib/validation'
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth'
import { getTaskById, updateTask, deleteTask } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    const tokenData = getUserFromToken(token)
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const task = await getTaskById(params.id)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.userId !== tokenData.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    const tokenData = getUserFromToken(token)
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const existingTask = await getTaskById(params.id)
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (existingTask.userId !== tokenData.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const updates = taskSchema.partial().parse(body)

    const updatedTask = await updateTask(params.id, updates)
    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  payload: { params: { id: string } },
) {
  const { params } = payload
  const { id } = await params
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    const tokenData = getUserFromToken(token)
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const existingTask = await getTaskById(id)
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (existingTask.userId !== tokenData.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await deleteTask(id)
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 },
      )
    }
    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 },
    )
  }
}
