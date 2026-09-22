import { Router } from 'express'
import { body, query, validationResult } from 'express-validator'
import { createTask, deleteTask, getTask, listTasks, updateTask } from '../controllers/taskController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

const router = Router()

function validateRequest(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: errors.array()[0].msg })
    return
  }
  next()
}

const commonValidation = [
  body('title').optional().trim().notEmpty().withMessage('Task title cannot be empty.'),
  body('description').optional().isString().withMessage('Task description must be text.'),
  body('project').optional().isMongoId().withMessage('A valid project ID is required.'),
  body('assignedTo').optional().isMongoId().withMessage('A valid assigned user ID is required.'),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid task status.'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid task priority.'),
  body('dueDate').optional().isISO8601().withMessage('A valid due date is required.'),
]

const createValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required.'),
  body('project').isMongoId().withMessage('A valid project ID is required.'),
  body('assignedTo').isMongoId().withMessage('A valid assigned user ID is required.'),
  body('dueDate').isISO8601().withMessage('A valid due date is required.'),
  ...commonValidation,
]

router.use(protect)
router.get('/', query('project').optional().isMongoId().withMessage('A valid project ID is required.'), query('status').optional().isIn(['TODO', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid task status.'), query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid task priority.'), validateRequest, listTasks)
router.get('/:id', getTask)
router.post('/', authorizeRoles('PROJECT_MANAGER'), createValidation, validateRequest, createTask)
router.put('/:id', commonValidation, validateRequest, updateTask)
router.patch('/:id', commonValidation, validateRequest, updateTask)
router.delete('/:id', authorizeRoles('PROJECT_MANAGER'), deleteTask)

export default router
