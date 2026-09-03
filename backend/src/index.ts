import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './auth'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.use('/api/auth', authRouter)

const port = process.env.PORT ? Number(process.env.PORT) : 4000
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
