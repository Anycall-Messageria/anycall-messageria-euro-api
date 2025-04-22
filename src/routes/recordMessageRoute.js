import { Router } from 'express'
import * as controller from '../controllers/recordMessageController.js'
import { uploads } from '../middlaware/uploadMiddleware.js'
import { sessionValidator } from '../middlaware/sessionValidator.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'

const router = Router()

router.get('/list', isCompanyExclusive, controller.list)
router.post('/add', isCompanyExclusive, controller.add)
router.post('/update', isCompanyExclusive, controller.update)
router.get('/get-record-message/:id', isCompanyExclusive, controller.getRecordMessage)
router.get('/get-message/:id', isCompanyExclusive, controller.getMessage)


export default router
