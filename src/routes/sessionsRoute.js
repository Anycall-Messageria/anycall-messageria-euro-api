import { Router } from 'express'
import { body } from 'express-validator'
import requestValidator from '../middlaware/requestValidator.js'
import * as controller from '../controllers/sessionsController.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'

const router = Router()

router.get('/list', isCompanyExclusive, controller.list)

router.get('/list-session', isCompanyExclusive, controller.listSessions)
router.get('/list-session/:status', isCompanyExclusive, controller.listSessionsStatus)


router.get('/get-session/:id', isCompanyExclusive, controller.getSessions)

router.post('/add', body('id').notEmpty(), body('isLegacy').notEmpty(), requestValidator, isCompanyExclusive,
controller.add)

router.get('/add', isCompanyExclusive, controller.addform)

router.get('/delete/:delete', isCompanyExclusive, controller.del)

router.post('/add-new', isCompanyExclusive, controller.addNew)
//router.get('/delete/*:id', controller.del)


export default router
