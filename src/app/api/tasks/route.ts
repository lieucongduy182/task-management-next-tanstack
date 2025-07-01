import { getTokenFromRequest, getUserFromToken } from '@/lib/auth'
import { createTask, getTasksByUserId } from '@/lib/database'
import { taskSchema } from '@/lib/validation'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json('Authentication required', { status: 401 })
    }

    const tokenData = await getUserFromToken(token)
    if (!tokenData) {
      return NextResponse.json('Invalid Token', { status: 401 })
    }

    const tasks = await getTasksByUserId(tokenData.userId)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json('Authentication required', { status: 401 })
    }

    const tokenData = await getUserFromToken(token)
    if (!tokenData) {
      return NextResponse.json('Invalid Token', { status: 401 })
    }

    const body = await request.json()
    const taskData = taskSchema.parse(body)

    const task = await createTask({
      ...taskData,
      userId: tokenData.userId,
    })

    return NextResponse.json(task, { status: 200 })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json('Internal Server Error', { status: 500 })
  }
}
