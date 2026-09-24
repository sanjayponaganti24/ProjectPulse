import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import { bootstrapAdmin } from '../services/bootstrapAdmin.js'

async function createAdmin() {
  try {
    await connectDB()
    await bootstrapAdmin()
  } finally {
    await mongoose.disconnect()
  }
}

createAdmin().catch((error) => {
  console.error('Failed to create admin:', error.message)
  process.exit(1)
})