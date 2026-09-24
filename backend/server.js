import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { connectDB } from './config/db.js'
import { bootstrapAdmin } from './services/bootstrapAdmin.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import issueRoutes from './routes/issueRoutes.js'
import milestoneRoutes from './routes/milestoneRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import searchRoutes from './routes/searchRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import userRoutes from './routes/userRoutes.js'

import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config()
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const port = process.env.PORT || 5000
const allowedOrigins = new Set(
  (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
)
const isVercelOrigin = (origin) => {
  try {
    const url = new URL(origin)
    return url.protocol === 'https:' &&
      url.hostname.endsWith('.vercel.app')
  } catch {
    return false
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || isVercelOrigin(origin)) {
        callback(null, origin || true)
        return
      }
      callback(null, false)
    },
    credentials: true,
  }),
)
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/projects/:projectId/milestones', milestoneRoutes)
app.use('/api/users', userRoutes)
app.use(notFound)
app.use(errorHandler)

try {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Add it to server/.env.')
  }
  await connectDB()
  await bootstrapAdmin()
  app.listen(port, () => {
    console.log(`ProjectPulse API listening on port ${port}`)
  })
} catch (error) {
  console.error(`ProjectPulse API could not start: ${error.message}`)
  process.exitCode = 1
}
