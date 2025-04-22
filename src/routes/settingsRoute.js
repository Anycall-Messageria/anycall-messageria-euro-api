import { Router } from 'express'
import * as controller from '../controllers/settingsController.js'
import { uploadsProfile } from '../middlaware/uploadMiddlewareProfile.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'

const router = Router()

router.post('/add-setting-session', uploadsProfile.single('profile_image'), isCompanyExclusive, controller.addSettingSession)

router.get('/update-setting-session/:id', isCompanyExclusive, controller.updateSettingSession)

export default router
