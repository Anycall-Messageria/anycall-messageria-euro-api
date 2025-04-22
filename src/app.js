import dotenv from 'dotenv'
import express from 'express'
import {server, app} from './../server.js'
import './websocket.js'
import routes from '../src/routes/index.js'
import __dirname from './../dirname.js'
import  dbPost  from './../database/dbPostgresClient.js'
import { init, cleanup, trocar } from '../src/wpp/whatsapp.js'
import cookieParser from 'cookie-parser'
import loggers from 'morgan'
import passport from 'passport'
import session from 'express-session'
import authRoute from './routes/authRoute.js'
//import authTokenRoute from './routes/authJwtRoute.js'
import cors from 'cors'
import passports from '../src/auth/auth.js'
import { monitoringSession  } from '../src/session/index.js'
import { listRestart, listRestartPause , listStart, listMonitor} from '../src/controllers/queuesController.js'
import { join } from 'path'
import flash from 'connect-flash'

dotenv.config({ path: __dirname + '/.env'})

passports(passport);

dbPost.authenticate().then(() => {
  console.log('Database Postgres connected...');
}).catch(err => {
  console.log('Error: ' + err);
})


app.use(cors())
app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({  extended: true }))

app.use(express.static((__dirname + '/assets')))
app.use(express.static(__dirname + '/node_modules'));


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, XMLHttpRequest, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

let maxTime = 36000000//Date.now() + (60 * 86400 * 1000)
app.use(session({  
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { secure:false, maxAge: maxTime }
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(loggers('dev'))

const setViewsDir = join(__dirname, 'src/views')

app.set('view engine', 'ejs');

app.set('views', setViewsDir);
app.use('/auth', authRoute)





function authenticationMiddleware(req, res, next) {
  let user = req.user
  if (req.isAuthenticated()) return next();
  res.redirect('/auth?fail=true');
}

app.use('/', authenticationMiddleware, routes)

trocar() 

const host = process.env.HOST || undefined
const port = parseInt(process.env.PORT ?? 8007)


const listenerCallback = async () => {
    let i = await init() 
    await listRestart()
    setInterval(() => { listRestartPause() } , 180000) 
    setInterval(() => { listMonitor() } , 180000) 
    //setInterval(() => { listStart() }, 60000)
    setInterval(() => { monitoringSession() }, 180000)
    console.log(`🚀 Server is listening on http://${host ? host : 'localhost'}:${port}`)
}

if (host) {
    //setInterval(() => { monitoringSession() }, 5000)
    server.listen(port, host, listenerCallback)
} else {
    server.listen(port, listenerCallback)
}

//nodeCleanup(cleanup) 
export default app
