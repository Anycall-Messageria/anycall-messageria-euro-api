import { Router } from 'express'
import { body, query } from 'express-validator'
import requestValidator from '../middlaware/requestValidator.js'
import { sessionValidator } from '../middlaware/sessionValidator.js'
import * as controller from '../controllers/chatsController.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'

const router = Router()

router.get('/report', isCompanyExclusive, controller.listReport)

router.get('/', query('id').notEmpty(), requestValidator, sessionValidator, isCompanyExclusive,  controller.getList)

router.post(
    '/send',
    query('id').notEmpty(),
    body('receiver').notEmpty(),
    //body('message').notEmpty(),
    requestValidator,
    sessionValidator,
    isCompanyExclusive,
    controller.send
)

router.post(
    '/send-button',
    query('id').notEmpty(),
    //body('receiver').notEmpty(),
    //body('text').notEmpty(),
    //requestValidator,
    sessionValidator,
    isCompanyExclusive,
    controller.sendButtons
)

router.post(
    '/new-send-button',
    //query('id').notEmpty(),
    body('receiver').notEmpty(),
    body('text').notEmpty(),
    requestValidator,
    isCompanyExclusive,
    controller.newSendButtons
)

router.post(
    '/send-survey-message',
    body('receiver').notEmpty(),
    requestValidator,
    isCompanyExclusive,
    controller.sendSurvey
)

router.post(
    '/send-react-message',
    body('receiver').notEmpty(),
    body('message.text').notEmpty(),
    body('massage_key').notEmpty(),
    requestValidator,
    isCompanyExclusive,
    controller.sendReactMessage
)

router.post(
    '/send-link',
    query('id').notEmpty(),
    //body('receiver').notEmpty(),
    //body('text').notEmpty(),
    //requestValidator,
    sessionValidator,
    isCompanyExclusive,
    controller.sendLink
)

router.post(
    '/send-list',
    query('id').notEmpty(),
    //body('receiver').notEmpty(),
    //body('text').notEmpty(),
    //requestValidator,
    sessionValidator,
    isCompanyExclusive,
    controller.sendList
)


router.post(
    '/send-midia',
    query('id').notEmpty(),
    body('receiver').notEmpty(),
    //requestValidator,
    sessionValidator,
    isCompanyExclusive,
    controller.sendMidia
)

router.post(
    '/send-contacts',
    query('id').notEmpty(),
    body('receiver').notEmpty(),
    //requestValidator,
    sessionValidator,
    isCompanyExclusive,
    controller.senContacts
)

router.post('/send-bulk', query('id').notEmpty(), requestValidator, sessionValidator, isCompanyExclusive, controller.sendBulk)
router.get('/find-status/:status',  requestValidator, isCompanyExclusive, controller.getFindStatus)
router.get('/find-phone/:phone',  requestValidator, isCompanyExclusive, controller.getFindId)  
router.post('/find-period',  body('start').notEmpty(), body('end').notEmpty(), 
requestValidator, isCompanyExclusive, controller.getFindPeriod)




export default router

