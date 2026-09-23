import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

const router = Router()
const userFields = 'name email role avatar createdAt organisation'
const validRoles = [
  'ORGANISATION_ADMIN',
  'PROJECT_MANAGER',
  'TEAM_LEAD',
  'MEMBER',
  'STAKEHOLDER',
]

function validateRequest(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: errors.array()[0].msg })
    return
  }
  next()
}

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

// Get single user
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(userFields)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' })
      return
    }
    res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
})

// Update user role (Organisation Admin only)
router.patch(
  '/:id/role',
  authorizeRoles('ORGANISATION_ADMIN'),
  [
    body('role')
      .isIn(validRoles)
      .withMessage(`Role must be one of: ${validRoles.join(', ')}.`),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const userToUpdate = await User.findById(req.params.id)
      if (!userToUpdate) {
        res.status(404).json({ success: false, message: 'User not found.' })
        return
      }

      // Check if trying to demote the last ORGANISATION_ADMIN
      if (
        userToUpdate.role === 'ORGANISATION_ADMIN' &&
        req.body.role !== 'ORGANISATION_ADMIN'
      ) {
        const adminCount = await User.countDocuments({ role: 'ORGANISATION_ADMIN' })
        if (adminCount <= 1) {
          res.status(400).json({
            success: false,
            message: 'Cannot demote the last Organisation Admin. Assign another admin first.',
          })
          return
        }
      }

      userToUpdate.role = req.body.role
      await userToUpdate.save()

      res.json({
        success: true,
        user: {
          id: userToUpdate._id.toString(),
          name: userToUpdate.name,
          email: userToUpdate.email,
          role: userToUpdate.role,
        },
        message: `Role for ${userToUpdate.name} updated to ${userToUpdate.role}.`,
      })
    } catch (error) {
      next(error)
    }
  },
)

// Invite/create new user with assigned role (Organisation Admin only)
router.post(
  '/invite',
  authorizeRoles('ORGANISATION_ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').trim().isEmail().withMessage('Please provide a valid email.'),
    body('role').isIn(validRoles).withMessage(`Role must be one of: ${validRoles.join(', ')}.`),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { name, email, role, password } = req.body
      const normalizedEmail = email.toLowerCase().trim()
      const existing = await User.findOne({ email: normalizedEmail })
      if (existing) {
        res.status(409).json({ success: false, message: 'A user with this email already exists.' })
        return
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role,
        organisation: req.user.organisation || null,
      })

      res.status(201).json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: `User ${user.name} created as ${user.role}.`,
      })
    } catch (error) {
      next(error)
    }
  },
)

export default router
