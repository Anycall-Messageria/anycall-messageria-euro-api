import { Router } from 'express'
import * as controller from '../controllers/metaController.js'
import { body } from 'express-validator'
import requestValidator from '../middlaware/requestValidator.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'

const router = Router()

router.get('/add-metas',  isCompanyExclusive, controller.addMetas)
router.get('/list-metas', isCompanyExclusive, controller.list)
router.get('/update-meta/:id', isCompanyExclusive, controller.updateMetas)
router.post('/add', isCompanyExclusive, controller.add)
router.post('/update', isCompanyExclusive, controller.update)
router.get('/target-mounth-all', isCompanyExclusive, controller.metaMes)
router.get('/target-mounth/:id', isCompanyExclusive, controller.metaMesAll)

export default router
