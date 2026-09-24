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
    const { name, email, password, role } = req.body

    const normalizedEmail = email.toLowerCase().trim()

    const existingUser = await User.findOne({
      email: normalizedEmail,
    })

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      })
      return
    }

    const publicRoles = [
      'PROJECT_MANAGER',
      'TEAM_LEAD',
      'MEMBER',
      'STAKEHOLDER',
    ]

    if (!publicRoles.includes(role)) {
      res.status(403).json({
        success: false,
        message:
          'Invalid registration role. Organisation Admin accounts are created by the system administrator.',
      })
      return
    }

    const organisation = await Organisation.findOne().sort({
      createdAt: 1,
    })

    if (!organisation) {
      res.status(503).json({
        success: false,
        message:
          'The ProjectPulse workspace has not been configured yet. Please contact the administrator.',
      })
      return
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      organisation: organisation._id,
    })

    res.status(201).json({
      success: true,
      user: getSafeUser(user),
      organisation: {
        id: organisation._id,
        name: organisation.name,
      },
      message: 'Account created successfully. Please log in.',
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
    const registrationRoles = adminExists
      ? ROLES_METADATA.filter((entry) => entry.role !== 'ORGANISATION_ADMIN')
      : []
    res.json({
      success: true,
      roles: ROLES_METADATA,
      registrationRoles,
      adminExists: !!adminExists,
      organisation: organisation || { name: 'ProjectPulse Workspace' },
    })
  } catch (error) {
    res.json({
      success: true,
      roles: ROLES_METADATA,
      registrationRoles: ROLES_METADATA.filter((entry) => entry.role !== 'ORGANISATION_ADMIN'),
      adminExists: false,
      organisation: { name: 'ProjectPulse Workspace' },
    })
  }
}

export { authCookieName, createToken, getSafeUser }
