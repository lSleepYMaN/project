import { Request, Response } from "express"

export const checkAuth = (req: Request, res: Response, next: Function) => {
    try {
       // const authHeader = req.headers['authorization']
       const token = req.cookies.token

        if(token){
            console.log(token)
            console.log('have token')
            return next()
        }
        else{
            console.log(token)
            console.log('no token')
            return res.status(200).json({
                type: 'error',
                message: 'กรุณา login',
                redirectTo: '/login',
            })
        }

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'failed' })
    }
}

export const checkAuth2 = (req: Request, res: Response, next: Function) => {
    try {

        if(req.session.userid){
            return next()
        }
        else{
            return res.redirect('/....')
        }

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'failed' })
    }
}