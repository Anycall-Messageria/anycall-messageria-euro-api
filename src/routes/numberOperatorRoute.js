import { Router } from 'express'
import { body } from 'express-validator'
import requestValidator from '../middlaware/requestValidator.js'
import * as controller from '../controllers/numberOperatorController.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'

const router = Router()

router.get('/list', isCompanyExclusive, controller.list)
router.get('/add', isCompanyExclusive, requestValidator,controller.add)
router.get('/update/:id', isCompanyExclusive, controller.update)
router.get('/del/:id',  isCompanyExclusive, controller.del)
router.post('/moving',  isCompanyExclusive, controller.movingDevices)
router.get('/banned',  isCompanyExclusive, controller.listBanned)


export default router

