import { Router } from 'express'
import {upload, list, savedb, del } from '../controllers/savevideoController.js'
import { isCompanyExclusive } from '../middlaware/autorizatelevel.js'

const router = Router()

router.get('/list', isCompanyExclusive, list)

router.post('/save-video', upload.single('fileupload'), isCompanyExclusive, (req, res) => {
    //res.json( 'save' );
    res.redirect('/medias/list')
});
 
//router.get('/add-media', isCompanyExclusive, add)

router.get('/del/:id', isCompanyExclusive, del)

export default router
