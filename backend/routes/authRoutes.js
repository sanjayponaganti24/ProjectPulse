import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { getCurrentUser, login, logout, register } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()
const validRoles = ['PROJECT_MANAGER', 'MEMBER']

const registrationValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Please provide a valid email.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').isIn(validRoles).withMessage('Role must be PROJECT_MANAGER or MEMBER.'),
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

router.post('/register', registrationValidation, validateRequest, register)
router.post('/login', loginValidation, validateRequest, login)
router.post('/logout', logout)
router.get('/me', protect, getCurrentUser)

export default router
