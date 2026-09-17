import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { connectDB } from './config/db.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import healthRoutes from './routes/healthRoutes.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use(notFound)
app.use(errorHandler)

try {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Add it to server/.env.')
  }
  await connectDB()
  app.listen(port, () => {
    console.log(`ProjectPulse API listening on port ${port}`)
  })
} catch (error) {
  console.error(`ProjectPulse API could not start: ${error.message}`)
  process.exitCode = 1
}
