import { Router } from 'express'
import { getReports } from '../controllers/reportController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)
router.get('/', getReports)

export default router