import { Router } from 'express'
import { body } from 'express-validator'
import requestValidator from '../middlaware/requestValidator.js'
import { sessionValidator } from '../middlaware/sessionValidator.js'
import * as controller from '../controllers/usersController.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'
import { uploadsProfile } from '../middlaware/uploadMiddlewareProfile.js'

const router = Router()

router.get('/list', isCompanyExclusive, controller.list)

router.post('/add',
 uploadsProfile.single('url_profile'),
 body('name').notEmpty(), 
 body('cpf').notEmpty(),
 //body('login').notEmpty(), 
 body('departament').notEmpty(), 
 body('office').notEmpty(), 
 body('email').notEmpty(), 
 body('password').notEmpty(),  
 body('level').notEmpty(), 
 isCompanyExclusive,
 requestValidator,
  controller.add)

router.post('/update',  uploadsProfile.single('url_profile'), isCompanyExclusive, controller.update)

export default router

