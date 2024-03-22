import { Request, Response } from "express"
import { Next } from "mysql2/typings/mysql/lib/parsers/typeCast"

export function checkAuth(req: Request, res: Response, next: Function){
    try {

        if(req.path === '/login' || req.path === 'register'){
            return next()
        }
        
        if (!req.session.userid) {
            return res.redirect('/login')
        }

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'failed' })
    }
}