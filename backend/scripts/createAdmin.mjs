import 'dotenv/config'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Organisation from '../models/Organisation.js'

const ADMIN_NAME = process.env.ADMIN_NAME || 'ProjectPulse Admin'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ORGANISATION_NAME =
  process.env.ORGANISATION_NAME || 'ProjectPulse Workspace'

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error(
    'ADMIN_EMAIL and ADMIN_PASSWORD must be configured in backend/.env',
  )
}

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not configured.')
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    let organisation = await Organisation.findOne().sort({ createdAt: 1 })

    if (!organisation) {
      organisation = await Organisation.create({
        name: ORGANISATION_NAME,
      })

      console.log(`Created organisation: ${organisation.name}`)
    }

    const existingAdmin = await User.findOne({
      role: 'ORGANISATION_ADMIN',
    })

    if (existingAdmin) {
      console.log(`Admin already exists: ${existingAdmin.email}`)
      console.log(`Organisation: ${organisation.name}`)
      return
    }

    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase().trim(),
      password: ADMIN_PASSWORD,
      role: 'ORGANISATION_ADMIN',
      organisation: organisation._id,
    })

    organisation.owner = admin._id
    await organisation.save()

    console.log('Organisation Admin created successfully.')
    console.log(`Name: ${admin.name}`)
    console.log(`Email: ${admin.email}`)
    console.log(`Organisation: ${organisation.name}`)
  } finally {
    await mongoose.disconnect()
  }
}

createAdmin().catch((error) => {
  console.error('Failed to create admin:', error.message)
  process.exit(1)
})