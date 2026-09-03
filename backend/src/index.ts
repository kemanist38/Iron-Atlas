import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './auth'
import gameRouter from './game'
import { createServer } from 'http'
import { Server } from 'socket.io'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api/games', gameRouter)

const port = process.env.PORT ? Number(process.env.PORT) : 4000

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' }
})

io.on('connection', (socket) => {
  console.log('socket connected', socket.id)

  socket.on('join-game', (gameId: string) => {
    socket.join(`game-${gameId}`)
    console.log(`socket ${socket.id} joined game-${gameId}`)
    socket.to(`game-${gameId}`).emit('player-joined', { socketId: socket.id })
  })

  socket.on('leave-game', (gameId: string) => {
    socket.leave(`game-${gameId}`)
    socket.to(`game-${gameId}`).emit('player-left', { socketId: socket.id })
  })

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id)
  })
})

httpServer.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
