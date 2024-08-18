import { Request, Response } from "express"
const jwt = require('jsonwebtoken')

export const checkAuth = (req: Request, res: Response, next: Function) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)

        if(user.id){
            console.log('authorize')
            return next()
        }
        else{
            console.log('no id')
            return res.status(200).json({
                type: 'error',
                message: 'Please login',
            })
        }

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ 
            error: 'failed',
            type: 'error',
            message: 'Please login', 
        })
    }
}

// export const checkAuth2 = (req: Request, res: Response, next: Function) => {
//     try {

//         if(req.session.userid){
//             return next()
//         }
//         else{
//             return res.redirect('/....')
//         }

//     } catch (error) {
//         console.error('error:', error);
//         return res.status(500).json({ error: 'failed' })
//     }
// }