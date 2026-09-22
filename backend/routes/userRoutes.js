import { Router } from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()
const userFields = 'name email role avatar createdAt'

router.use(protect)

// List all workspace users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({}).select(userFields).sort({ name: 1 })
    res.json({ success: true, users })
  } catch (error) {
    next(error)
  }
})

export default router
