import { Request, Response } from "express"
import { Next } from "mysql2/typings/mysql/lib/parsers/typeCast"

export const checkAuth = (req: Request, res: Response, next: Function) => {
    try {

        if(req.session.userid){
            return next()
        }
        else{
            return res.redirect('/login')
        }

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'failed' })
    }
}