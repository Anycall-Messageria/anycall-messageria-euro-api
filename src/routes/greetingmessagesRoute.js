import { Router } from 'express'
import * as controller from '../controllers/greetingmessageController.js'
import { uploads } from '../middlaware/uploadMiddleware.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'

const router = Router()

router.get('/list-greetingmessages', isCompanyExclusive, controller.list)

router.post('/add', isCompanyExclusive, controller.add)

router.post('/update', isCompanyExclusive, controller.update)

router.get('/get-message', isCompanyExclusive, controller.getGreetingmessage)

export default router
