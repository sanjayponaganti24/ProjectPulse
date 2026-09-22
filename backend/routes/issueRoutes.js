import { Router } from 'express'
import { body, query, validationResult } from 'express-validator'
import { createIssue, deleteIssue, getIssue, listIssues, updateIssue } from '../controllers/issueController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()
const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

function validateRequest(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: errors.array()[0].msg })
    return
  }
  next()
}

const commonValidation = [
  body('title').optional().trim().notEmpty().withMessage('Issue title cannot be empty.'),
  body('description').optional().isString().withMessage('Issue description must be text.'),
  body('project').optional().isMongoId().withMessage('A valid project ID is required.'),
  body('task').optional({ nullable: true }).isMongoId().withMessage('A valid task ID is required.'),
  body('assignedTo').optional({ nullable: true }).isMongoId().withMessage('A valid assigned user ID is required.'),
  body('severity').optional().isIn(severities).withMessage('Invalid issue severity.'),
  body('status').optional().isIn(statuses).withMessage('Invalid issue status.'),
]

router.use(protect)
router.get(
  '/',
  query('project').optional().isMongoId().withMessage('A valid project ID is required.'),
  query('severity').optional().isIn(severities).withMessage('Invalid issue severity.'),
  query('status').optional().isIn(statuses).withMessage('Invalid issue status.'),
  validateRequest,
  listIssues,
)
router.get('/:id', getIssue)
router.post(
  '/',
  body('title').trim().notEmpty().withMessage('Issue title is required.'),
  body('project').isMongoId().withMessage('A valid project ID is required.'),
  ...commonValidation,
  validateRequest,
  createIssue,
)
router.put('/:id', commonValidation, validateRequest, updateIssue)
router.patch('/:id', commonValidation, validateRequest, updateIssue)
router.delete('/:id', deleteIssue)

export default router
