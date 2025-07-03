import { Server as NetServer } from 'http'
import { Server as ServerIO } from 'socket.io'
import { NextApiRequest, NextApiResponse } from 'next'

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: {
    server: NetServer & {
      io?: ServerIO
    }
  }
}

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseServerIO,
) {
  if (!res.socket.server.io) {
    console.log('Starting Socket.io server...')
    const io = new ServerIO(res.socket.server, {
      cors: {
        origin:
          process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
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

    res.socket.server.io = io
  } else {
    console.log('Socket.io server already running')
  }

  res.end()
}
