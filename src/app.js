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
//import authTokenRoute from './routes/authJwtRoute.js'
import cors from 'cors'
import passports from '../src/auth/auth.js'
import { monitoringSession  } from '../src/session/index.js'
import { listRestart, listRestartPause , listStart, listMonitor} from '../src/controllers/queuesController.js'
import { cleanupContextManager } from '../src/controllers/automateController.js'
import PusherEvents from './lib/pusher-events.js'
import Queue from './queues/queues.js'
import { join } from 'path'

dotenv.config({ path: __dirname + '/.env'})

const pusherEvents = new PusherEvents();

passports(passport);

dbPost.authenticate().then(() => {
  console.log('Database Postgres connected...');
}).catch(err => {
  console.log('Error: ' + err);
})


app.use((req, res, next) => {
  // Headers de segurança básicos
  res.removeHeader('X-Powered-By')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  next()
})

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:8045',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8045'
]

app.use(cors({
  origin: (origin, callback) => {
    // Permite requests sem origin (mobile apps, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Não permitido pelo CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))


app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({  extended: true }))

app.use(express.static((__dirname + '/assets')))
app.use(express.static(__dirname + '/node_modules'));


app.use(passport.initialize());
app.use(passport.session());
app.use(loggers('dev'))


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
    
    // Inicializar processamento de filas
    Queue.process()
    console.log('🔄 Queue processors iniciados')
    
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

const gracefulShutdown = () => {
    console.info('Encerrando servidor gracefuly...')
    
    // Cleanup do sistema de contextos
    cleanupContextManager()
    
    server.close(() => {
        console.info('Servidor HTTP fechado.')
        dbPost.close().then(() => 
            console.info('Conexão com DB Postgres fechada.')
        ).catch(err => 
            console.error('Erro ao fechar DB:', err)
        )
        process.exit(0)
    })

    setTimeout(() => {
        console.error('Timeout no graceful shutdown. Forçando encerramento.')
        process.exit(1)
    }, 10000)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

//nodeCleanup(cleanup) 
export default app
