import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import path from 'path'
import { connectDB } from './config/db.js'
import User from './models/User.js'
import Project from './models/Project.js'
import Task from './models/Task.js'
import Issue from './models/Issue.js'
import Milestone from './models/Milestone.js'
import Organisation from './models/Organisation.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

async function seed() {
  try {
    await connectDB()
    await Promise.all([
      User.init(),
      Organisation.init(),
      Project.init(),
      Task.init(),
      Issue.init(),
      Milestone.init(),
    ])
    console.log('ProjectPulse database indexes are ready. No records were inserted.')
  } catch (error) {
    console.error('Seed error:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

seed()
