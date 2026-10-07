import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authCookieName } from '../controllers/authController.js'

export async function protect(req, res, next) {
  try {
    const token = req.cookies[authCookieName]
    if (!token) {
      res.status(401).json({ success: false, message: 'Please sign in to continue.' })
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)
    if (!user) {
      res.status(401).json({ success: false, message: 'Your session is no longer valid.' })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Your session is no longer valid. Please sign in again.' })
  }
}
