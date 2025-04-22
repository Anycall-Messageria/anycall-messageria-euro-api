import { Router } from 'express'
import * as controller from '../controllers/ocorrencesController.js'
import { sessionValidator } from '../middlaware/sessionValidator.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'

const router = Router()

router.get('/list', isCompanyExclusive, controller.list)
router.post('/add', isCompanyExclusive, controller.add)
router.post('/update-ocorrence', isCompanyExclusive, controller.update)

export default router
