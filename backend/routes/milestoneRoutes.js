import { Router } from 'express'
import { body, query, validationResult } from 'express-validator'
import {
  createMilestone,
  deleteMilestone,
  getMilestone,
  listMilestones,
  updateMilestone,
} from '../controllers/milestoneController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

const router = Router({ mergeParams: true })

function validateRequest(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: errors.array()[0].msg })
    return
  }
  next()
}

const commonValidation = [
  body('name').optional().trim().notEmpty().withMessage('Milestone name cannot be empty.'),
  body('description').optional().isString().withMessage('Milestone description must be text.'),
  body('project').optional().isMongoId().withMessage('A valid project ID is required.'),
  body('dueDate').optional().isISO8601().withMessage('A valid due date is required.'),
  body('status').optional().isIn(['PLANNED', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid milestone status.'),
]

const createValidation = [
  body('name').trim().notEmpty().withMessage('Milestone name is required.'),
  body('project').isMongoId().withMessage('A valid project ID is required.'),
  body('dueDate').isISO8601().withMessage('A valid due date is required.'),
  ...commonValidation,
]

router.use(protect)

router.get('/', query('project').optional().isMongoId().withMessage('A valid project ID is required.'), validateRequest, listMilestones)
router.get('/:id', getMilestone)
router.post('/', authorizeRoles('PROJECT_MANAGER'), createValidation, validateRequest, createMilestone)
router.put('/:id', commonValidation, validateRequest, updateMilestone)
router.patch('/:id', commonValidation, validateRequest, updateMilestone)
router.delete('/:id', authorizeRoles('PROJECT_MANAGER'), deleteMilestone)

export default router