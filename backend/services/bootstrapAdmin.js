import User from '../models/User.js'
import Organisation from '../models/Organisation.js'

const requiredAdminVariables = [
  'ADMIN_NAME',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'ORGANISATION_NAME',
]

function requireAdminConfiguration() {
  const missing = requiredAdminVariables.filter((name) => !process.env[name])
  if (missing.length > 0) {
    throw new Error(`Initial admin bootstrap requires: ${missing.join(', ')}`)
  }
}

export async function bootstrapAdmin() {
  const existingAdmin = await User.exists({ role: 'ORGANISATION_ADMIN' })

  if (existingAdmin) {
    console.log('ProjectPulse bootstrap: initial organisation/admin verified.')
    return
  }

  requireAdminConfiguration()

  let organisation = await Organisation.findOne().sort({ createdAt: 1 })
  let admin

  if (organisation) {
    admin = await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL.toLowerCase().trim(),
      password: process.env.ADMIN_PASSWORD,
      role: 'ORGANISATION_ADMIN',
      organisation: organisation._id,
    })

    if (!organisation.owner) {
      organisation.owner = admin._id
      await organisation.save()
    }
  } else {
    admin = await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL.toLowerCase().trim(),
      password: process.env.ADMIN_PASSWORD,
      role: 'ORGANISATION_ADMIN',
    })

    organisation = await Organisation.create({
      name: process.env.ORGANISATION_NAME,
      owner: admin._id,
    })

    admin.organisation = organisation._id
    await admin.save()
  }

  console.log('ProjectPulse bootstrap: initial organisation/admin verified.')
}
