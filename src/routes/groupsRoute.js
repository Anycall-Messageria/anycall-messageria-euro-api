import { Router } from 'express'
import { body, query } from 'express-validator'
import requestValidator from '../middlaware/requestValidator.js'
import { sessionValidator } from '../middlaware/sessionValidator.js'
import * as controller from '../controllers/groupsController.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'

const router = Router()

router.get('/', query('id').notEmpty(), requestValidator, sessionValidator, isCompanyExclusive, controller.getList)

router.get('/meta/:jid', query('id').notEmpty(), requestValidator, sessionValidator, isCompanyExclusive, controller.getGroupMetaData)

router.post(
    '/send',
    query('id').notEmpty(),
    body('receiver').notEmpty(),
    body('message').notEmpty(),
    requestValidator,
    sessionValidator,
    isCompanyExclusive,
    controller.send
)

router.post('/create-group',  
query('id').notEmpty(),
body('receiver').notEmpty(),
body('title').notEmpty(),
body('participants').notEmpty(),
isCompanyExclusive,
controller.createActionGroup
)

router.post('/move-user-group',  
query('id').notEmpty(),
body('receiver').notEmpty(),
body('idGroup').notEmpty(),
body('move').notEmpty(),
body('participants').notEmpty(),
isCompanyExclusive,
controller.moveActionParcipantsGroup
)

router.post('/update-subject-group',  
query('id').notEmpty(),
body('receiver').notEmpty(),
body('idGroup').notEmpty(),
body('subject').notEmpty(),
isCompanyExclusive,
controller.alterActionGroupsSubject
)

router.post('/update-description-group',  
query('id').notEmpty(),
body('receiver').notEmpty(),
body('idGroup').notEmpty(),
body('description').notEmpty(),
isCompanyExclusive,
controller.alterActionGroupsDescription
)

router.post('/alter-image-group', 
query('id').notEmpty(),
body('receiver').notEmpty(),
body('image').notEmpty(),
isCompanyExclusive,
controller.alterImageProfileGroup)


export default router
