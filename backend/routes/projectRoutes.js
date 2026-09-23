import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import {
  addMember,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  removeMember,
  updateProject,
} from '../controllers/projectController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

const router = Router()
const projectCreators = [protect, authorizeRoles('ORGANISATION_ADMIN', 'PROJECT_MANAGER')]

function validateRequest(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: errors.array()[0].msg })
    return
  }
  next()
}

const createValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required.'),
  body('startDate').isISO8601().withMessage('A valid start date is required.'),
  body('deadline').isISO8601().withMessage('A valid deadline is required.'),
  body('status').optional().isIn(['PLANNED', 'ACTIVE', 'COMPLETED']).withMessage('Invalid project status.'),
]

const updateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty.'),
  body('startDate').optional().isISO8601().withMessage('A valid start date is required.'),
  body('deadline').optional().isISO8601().withMessage('A valid deadline is required.'),
  body('status').optional().isIn(['PLANNED', 'ACTIVE', 'COMPLETED']).withMessage('Invalid project status.'),
]

router.use(protect)
router.get('/', listProjects)
router.post('/', ...projectCreators.slice(1), createValidation, validateRequest, createProject)
router.get('/:id', getProject)
router.put('/:id', updateValidation, validateRequest, updateProject)
router.delete('/:id', deleteProject)
router.post('/:id/members', addMember)
router.delete('/:id/members/:memberId', removeMember)

export default router
