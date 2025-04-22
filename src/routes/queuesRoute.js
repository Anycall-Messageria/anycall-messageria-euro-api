import { Router } from 'express'
import {  //addqueueText, addqueueMidia, addqueueLink, addqueueList, editqueueText
    list, uploadFile, listId, start, del, pauseCamp, msgStart, updateText, stopCamp,
    sendBulkMessage, uploadFileMidia }  from '../controllers/queuesController.js'
import { uploads } from '../middlaware/uploadMiddleware.js'
import { uploadMiddleware } from '../middlaware/uploadMultMiddleware.js'
import { sessionValidator } from '../middlaware/sessionValidator.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'


const router = Router()

//router.get('/add-text', isCompanyExclusive, addqueueText)
//router.get('/edit-text/:id', isCompanyExclusive, editqueueText)
router.post('/update-text', isCompanyExclusive, updateText)
//router.get('/add-midia', isCompanyExclusive, addqueueMidia)
//router.get('/add-link', isCompanyExclusive, addqueueLink)
//router.get('/add-list', isCompanyExclusive, addqueueList)
//router.get('/add-filter', isCompanyExclusive, addqueueFilter)
//router.get('/add-button', isCompanyExclusive, addqueueButton)
router.post('/save-queues', uploads.single('fileupload'), isCompanyExclusive, uploadFile)
router.post('/save-queues-midia', uploads.single('fileupload'), isCompanyExclusive, uploadFileMidia)
router.get('/list',  isCompanyExclusive, isCompanyExclusive, list)
router.post('/del', isCompanyExclusive, del)
router.get('/list/:id', isCompanyExclusive, listId)
router.post('/start', isCompanyExclusive, start)
router.post('/pause', isCompanyExclusive, pauseCamp)
router.post('/stop', isCompanyExclusive, stopCamp)
router.post('/send-bulk', isCompanyExclusive, sendBulkMessage)
router.post('/msgStart', isCompanyExclusive, msgStart)
//router.post('/save-queues-filter', uploads.single('fileupload'), isCompanyExclusive, createFile)

export default router
