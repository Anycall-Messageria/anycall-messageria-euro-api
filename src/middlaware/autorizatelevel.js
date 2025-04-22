const autorizateLevel = (req, res, next) => {
    if(req.isAuthenticated() && req.user.level < 3){
        return next()
    }
    req.flash("not_authorizad", "Você não esta autorizado a acessar este módulo")
    res.redirect("/home/notauthorized")
}


const autorizateOperador = (req, res, next) => {
    if(req.isAuthenticated() && req.user.level >= 2){
        return next()
    }
    req.flash("not_authorizad", "Você não esta autorizado a acessar este módulo")
    res.redirect("/home/notauthorized")
}

const autorizateLevelBack = (req, res, next) => {
    if(req.isAuthenticated() &&  req.user.level < 3 || req.user.level == 4){
        return next()
    }
    req.flash("not_authorizad", "Você não esta autorizado a acessar este módulo")
    res.redirect("/home/notauthorized")
}

const isLevel = (req, res, next) => {
    if(req.isAuthenticated()){
        res.locals.isLevel = req.user.level
        res.locals.isAdmin = req.user.isadmin
        return next()
    }
    
}

const isCompanyExclusive = (req, res, next) => {
    if(req.isAuthenticated()){
        res.locals.user_company = req.user.user_company
        res.locals.url_profile = req.user.url_profile
        res.locals.name = req.user.name
        return next()
    }
}

export { autorizateLevel, autorizateLevelBack, isLevel, autorizateOperador, isCompanyExclusive  }