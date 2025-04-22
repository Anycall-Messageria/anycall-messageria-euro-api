import dotenv from 'dotenv'
import __dirname from '../../dirname.js'
dotenv.config({ path: __dirname + '/.env'})

import jwt from 'jsonwebtoken'
import {  getUserAuth , getRefreshTokenId } from '../controllers/usersController.js'
import bcryptjs from 'bcryptjs'
import { generateRefreshToken } from '../providers/generateRefreshToken.js'
import response from '../../response.js'
import dayjs from 'dayjs'

const authToken = async(req, res) => {
  try {
    const users = await getUserAuth(req.body.email)
    if(!users){
       return res.status(500).json({message: 'Login inválido!'});
    }
     const a = bcryptjs.compare(req.body.password, users.password).then(async (isMatch) => {
        try {
          if (!isMatch){
            return res.status(500).json({message: 'Senha inválida!'});
          }else{
             const id = users.id; 
             const token = jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn:  3600 })// expires in 3600 (60min)
             const refreshTokenGen = await generateRefreshToken(id)
             return res.json({ auth: true, user: users.email, token: token, refreshToken: refreshTokenGen  })
          } 
        } catch (error) {
          return res.status(500).json({message: 'server application error'});
        }
      })
  } catch (err) {
    const data = { err }
    console.log(err)
    response(res, 500, false, 'server application error', data)
  }
}


const refreshTokenGenarate = async(req, res) => {
    const find = await getRefreshTokenId(req.body.id)
    try {        
        if(!find){
            return response(res, 401, false, 'Refresh token ivalid.')
        }
        const id = find.userid
        const token = jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn:  3600}) // expires in 3600 (60min)
        const verifyRefreshTokenExpired = dayjs().isAfter(dayjs.unix(find.experes_in)) 
        if(verifyRefreshTokenExpired){
          const refreshTokenJwt = await generateRefreshToken(id)
          return res.json({ auth: true, user: find.email, token: token, refreshToken: refreshTokenJwt})
        }
        return res.json({ auth: true, user: find.email, token: token})
    } catch (err) {
       const data = { err }
       console.log(err)
       response(res, 500, false, 'Refresh token dont generate.', data)
    }
}

const logoutApi = async (req, res) => {
  try {
    res.json({ auth: false, token: null })
  } catch (err) {
    const data = { err }
    console.log(err)
    response(res, 500, false, 'server application error', data)
  }
}

export { authToken, logoutApi, refreshTokenGenarate}