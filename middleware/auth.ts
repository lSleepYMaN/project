import { Request, Response } from "express"
import cookie from 'cookie-parser'
import { Next } from "mysql2/typings/mysql/lib/parsers/typeCast"
import jwt, { decode, verify } from 'jsonwebtoken'
import * as userModel from '../models/userModel'


export const checkAuth = async (req: Request, res: Response, next: Next) => {
    try {
        const token = req.cookies.login_token

        if(!token){
            res.redirect('/login')
        }

        const conToken = jwt.verify(token, 'test123') as {username: string}
        const check = await userModel.getUsername(conToken.username)
        if (!check) {
            console.error("please login")
            return res.redirect('/login')
        } else {
            return next()
        }

            
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'failed' })
    }
}