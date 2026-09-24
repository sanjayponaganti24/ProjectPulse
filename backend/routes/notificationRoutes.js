import { Router } from 'express'
import {
  createNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notificationController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)
router.get('/', listNotifications)
router.post('/', createNotification)
router.patch('/read-all', markAllNotificationsRead)
router.patch('/:id/read', markNotificationRead)

export default router
