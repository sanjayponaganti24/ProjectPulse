import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const authCookieName = 'projectpulse_token'

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
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' })
      return
    }

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role })
    res.status(201).json({ success: true, user: getSafeUser(user) })
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

export { authCookieName, createToken, getSafeUser }
