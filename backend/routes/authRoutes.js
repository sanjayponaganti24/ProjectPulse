import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { getCurrentUser, getRoles, login, logout, register } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()
const validRoles = [
  'ORGANISATION_ADMIN',
  'PROJECT_MANAGER',
  'TEAM_LEAD',
  'MEMBER',
  'STAKEHOLDER',
]

const registrationValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Please provide a valid email.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').optional().isIn(validRoles).withMessage(`Role must be one of: ${validRoles.join(', ')}.`),
  body('organisationName').optional().trim(),
]

const loginValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email.'),
  body('password').notEmpty().withMessage('Password is required.'),
]

function validateRequest(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: errors.array()[0].msg })
    return
  }
  next()
}

router.get('/roles', getRoles)
router.post('/register', registrationValidation, validateRequest, register)
router.post('/login', loginValidation, validateRequest, login)
router.post('/logout', logout)
router.get('/me', protect, getCurrentUser)

export default router
