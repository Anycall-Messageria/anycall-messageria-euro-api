
import { response } from 'express';
import jwt from 'jsonwebtoken'

import dotenv from 'dotenv'
import __dirname from '../../dirname.js'
dotenv.config({ path: __dirname + '/.env'})

function tokenValited(req, res, next){
  try {
    const [, token] = req.headers.authorization?.split(' ') || [' ', ' '];
    if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' })
    jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
      console.log(err, decoded)
      if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' })
      req.userIdAuth = decoded.id
      next()
    })
  } catch (err) {
    const data = { err }
    console.log(err)
    response(res, 500, false, 'server application error', data)
  }
}

  export { tokenValited }
 