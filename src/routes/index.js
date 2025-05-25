import { Router } from 'express'
import sessionsRoute from './sessionsRoute.js'
import chatsRoute from './chatsRoute.js'
import groupsRoute from './groupsRoute.js'
import savevideoRoute from './savevideossRoute.js'
import queueRoute from './queuesRoute.js'
import userRoute from './usersRoute.js'
import servicequeueRoute from './servicequeuesRoute.js'
import tagsRoute from './tagsRoute.js'
import issuersRoute from './issuersRoute.js'
import greetingmessagesRoute from './greetingmessagesRoute.js'
import settingsRoute from './settingsRoute.js'
import miscsRoute from './miscsRoute.js'
import recordMessage from './recordMessageRoute.js'
import campaingRoute from './campaingsRoute.js'
import response from '../../response.js'
import ocorrencesRoute from './ocorrencesRoute.js'
import mobilesRoutes from './mobilesRoute.js'
import numberOperatorRoutes from './numberOperatorRoute.js'
import cacheRoute from './cacheRoute.js'


const router = Router()
router.use('/sessions', sessionsRoute)
router.use('/chats', chatsRoute)
router.use('/queues', queueRoute)
router.use('/groups', groupsRoute)
router.use('/medias', savevideoRoute)
router.use('/users', userRoute)
router.use('/service-queues', servicequeueRoute)
router.use('/tags', tagsRoute)
router.use('/issuers', issuersRoute)
router.use('/greetingmessages', greetingmessagesRoute)
router.use('/settings', settingsRoute)
router.use('/miscs', miscsRoute)
router.use('/record-messages', recordMessage)
router.use('/campaings', campaingRoute)
router.use('/ocorrences', ocorrencesRoute)
router.use('/mobile', mobilesRoutes)
router.use('/number-operator', numberOperatorRoutes)
router.use('/cache', cacheRoute)


router.all('*', (req, res) => {
    response(res, 404, false, 'The requested url cannot be found.')
})

export default router
