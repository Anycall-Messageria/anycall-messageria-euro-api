import express from 'express'
const router = express.Router()
import { body, query } from 'express-validator'
import requestValidator from '../middlaware/requestValidator.js'
import { authToken , logoutApi , refreshTokenGenarate } from '../middlaware/authJwt.js'

//authentication
router.post('/login-auth', 
body('email').notEmpty(),
body('password').notEmpty(),
requestValidator,
authToken)

router.post('/logout-api', logoutApi);

router.post('/refresh-token-api', 
body('id').notEmpty(),
requestValidator,
refreshTokenGenarate);

export default router

