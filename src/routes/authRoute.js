import express from 'express'
const router = express.Router()
import passport from 'passport'

router.get('/', (req, res, next) => {
    if (req.query.fail)
        res.render('login',  { Message: req.flash('error') });
   else
      res.redirect('/auth?fail=true')
        
});

router.post('/',
        passport.authenticate('local', { 
        successRedirect: '/dashboard/dashboard', 
        failureRedirect: '/auth?fail=true',
        badRequestMessage: 'The email does not match any account', // change "missing credentials" message
        failureFlash: true
    })
)

export default router

