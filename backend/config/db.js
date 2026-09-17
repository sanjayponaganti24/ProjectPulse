import mongoose from 'mongoose'

export async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured. Add your MongoDB Atlas connection string to server/.env.')
  }

  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`)
  }
}
