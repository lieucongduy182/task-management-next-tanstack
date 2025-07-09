import { Server as NetServer } from 'http'
import { Server as ServerIO } from 'socket.io'
import { NextRequest } from 'next/server'

declare global {
  var io: ServerIO | undefined
}

export async function GET(req: NextRequest) {
  if (!global.io) {
    console.log('Starting Socket.io server...')

    const httpServer = new NetServer()
    const io = new ServerIO(httpServer, {
      cors: {
        origin:
          process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
      path: '/api/socket',
    })

    // Handle socket connections
    io.on('connection', (socket) => {
      console.log('User connected', socket.id)

      socket.on('join-workspace', (workSpaceId: string) => {
        socket.join(workSpaceId)
        console.log(`User ${socket.id} joined workspace ${workSpaceId}`)
      })

      // Handle task events
      socket.on('task-created', (data) => {
        socket.broadcast.to(data.workSpaceId).emit('task-updated', {
          task: data.task,
          type: 'TASK_CREATED',
        })
      })

      socket.on('task-updated', (data) => {
        socket.broadcast.to(data.workSpaceId).emit('task-updated', {
          task: data.task,
          type: 'TASK_UPDATED',
        })
      })

      socket.on('task-deleted', (data) => {
        socket.broadcast.to(data.workSpaceId).emit('task-updated', {
          taskId: data.taskId,
          type: 'TASK_DELETED',
        })
      })

      socket.on('disconnect', () => {
        console.log('User disconnected', socket.id)
      })
    })

    global.io = io

    httpServer.listen(3001, () => {
      console.log('Socket.io server listening on port 3001')
    })
  }

  return new Response('Socket.io server is running', {
    status: 200,
  })
}
