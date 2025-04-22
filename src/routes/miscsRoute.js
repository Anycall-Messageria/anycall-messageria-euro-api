import { Router } from 'express'
import { body, query } from 'express-validator'
import requestValidator from '../middlaware/requestValidator.js'
import { sessionValidator } from '../middlaware/sessionValidator.js'
import * as controller from '../controllers/miscsController.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'

const router = Router()


router.post('/alter-image', 
query('id').notEmpty(),
body('receiver').notEmpty(),
body('image').notEmpty(),
isCompanyExclusive,
controller.alterImageProfile)

router.post('/alter-name', 
query('id').notEmpty(),
body('receiver').notEmpty(),
body('name').notEmpty(),
isCompanyExclusive,
controller.updateNameProfile)

router.post('/alter-status', 
query('id').notEmpty(),
body('receiver').notEmpty(),
body('status').notEmpty(),
isCompanyExclusive,
controller.updateStatusProfile)

router.post('/alter-block', 
query('id').notEmpty(),
body('profile').notEmpty(),
body('type').notEmpty(),
isCompanyExclusive,
controller.getBlockProfileWpp)



export default router

