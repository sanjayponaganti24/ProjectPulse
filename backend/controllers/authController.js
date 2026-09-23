import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Organisation from '../models/Organisation.js'

const authCookieName = 'projectpulse_token'

export const ROLES_METADATA = [
  {
    role: 'ORGANISATION_ADMIN',
    name: 'Organisation Admin',
    description: 'Manage users, teams, projects, roles, and organisation configuration',
  },
  {
    role: 'PROJECT_MANAGER',
    name: 'Project Manager',
    description: 'Plan projects, manage milestones, sprints, assignments, and reports',
  },
  {
    role: 'TEAM_LEAD',
    name: 'Team Lead',
    description: 'Manage team workload, review tasks, resolve blockers, and coordinate releases',
  },
  {
    role: 'MEMBER',
    name: 'Developer / Member',
    description: 'Work on assigned tasks, update progress, comment, and report issues',
  },
  {
    role: 'STAKEHOLDER',
    name: 'Stakeholder',
    description: 'View authorized project progress, milestones, risks, and reports (Read-only)',
  },
]

function createToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Add it to server/.env.')
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function getSafeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.organisation ? { organisation: user.organisation } : {}),
    ...(user.avatar ? { avatar: user.avatar } : {}),
  }
}

function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role, organisationName } = req.body
    const normalizedEmail = email.toLowerCase().trim()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' })
      return
    }

    const adminExists = await User.exists({ role: 'ORGANISATION_ADMIN' })
    let assignedRole = role || 'MEMBER'

    let organisation = await Organisation.findOne().sort({ createdAt: 1 })

    if (!adminExists) {
      // First user becomes ORGANISATION_ADMIN and initializes the workspace
      assignedRole = 'ORGANISATION_ADMIN'
      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: assignedRole,
      })

      if (!organisation) {
        organisation = await Organisation.create({
          name: (organisationName || 'ProjectPulse Workspace').trim(),
          owner: user._id,
        })
      } else {
        organisation.owner = user._id
        await organisation.save()
      }

      user.organisation = organisation._id
      await user.save()

      setAuthCookie(res, createToken(user._id.toString()))
      res.status(201).json({
        success: true,
        user: getSafeUser(user),
        organisation: { id: organisation._id, name: organisation.name },
        message: 'Workspace created. You are now the Organisation Admin.',
      })
      return
    }

    // If an Organisation Admin already exists, users cannot self-register as ORGANISATION_ADMIN
    if (assignedRole === 'ORGANISATION_ADMIN') {
      res.status(403).json({
        success: false,
        message:
          'An Organisation Admin already exists for this workspace. Please register with another role or ask the administrator for an invitation.',
      })
      return
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: assignedRole,
      organisation: organisation ? organisation._id : null,
    })

    setAuthCookie(res, createToken(user._id.toString()))

    res.status(201).json({
      success: true,
      user: getSafeUser(user),
      organisation: organisation ? { id: organisation._id, name: organisation.name } : null,
    })
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' })
      return
    }

    setAuthCookie(res, createToken(user._id.toString()))
    res.json({ success: true, user: getSafeUser(user) })
  } catch (error) {
    next(error)
  }
}

export async function getCurrentUser(req, res) {
  res.json({ success: true, user: getSafeUser(req.user) })
}

export function logout(req, res) {
  res.clearCookie(authCookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  res.json({ success: true, message: 'You have been logged out.' })
}

export async function getRoles(req, res) {
  try {
    const adminExists = await User.exists({ role: 'ORGANISATION_ADMIN' })
    const organisation = await Organisation.findOne().select('name domain')
    res.json({
      success: true,
      roles: ROLES_METADATA,
      adminExists: !!adminExists,
      organisation: organisation || { name: 'ProjectPulse Workspace' },
    })
  } catch (error) {
    res.json({
      success: true,
      roles: ROLES_METADATA,
      adminExists: false,
      organisation: { name: 'ProjectPulse Workspace' },
    })
  }
}

export { authCookieName, createToken, getSafeUser }
