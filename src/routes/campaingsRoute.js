import { Router } from 'express'
import * as controller from '../controllers/campaingsController.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'

const router = Router()

router.get('/list-campaing/:id', isCompanyExclusive, controller.list)


export default router
