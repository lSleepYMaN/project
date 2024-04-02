import { Request, Response } from "express"
import * as userModel from '../models/userModel'
import bcrypt from 'bcryptjs'
import * as sendEmail from '../utils/sendEmail'
const jwt = require('jsonwebtoken')

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userModel.allUser()
        res.json(users)
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'failed' })
    }
}

export const getUserById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    try {
        const user = await userModel.userById(id)
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'failed' })
    }
}

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password, comPassword } = req.body
    const validUsername = /^[a-zA-Z0-9_]{8,}$/.test(username)
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const validPass = /^.{8,}$/.test(password)
    
    if(!validUsername){
        return res.status(400).json({ error: 'Username ไม่ตรงตามเงื่อนไข'})
    }

    if (!validEmail) {
        return res.status(400).json({ error: 'Email ไม่ถูกต้อง'})
    }

    if (!validPass) {
        return res.status(400).json({ error: 'Password ไม่ตรงตามเงื่อนไข'})
    }

    try {
        const checkUser = await userModel.getUsername(username)

        if (checkUser) {
            return res.status(400).json({ error: 'Username ถูกใช้งานแล้ว' })
        }

        const checkEmail = await userModel.getEmail(email)

        if (checkEmail) {
            return res.status(400).json({ error: 'Email ถูกใช้งานแล้ว' })
        }

        if (comPassword != password){
            return res.status(400).json({ error: 'Password ไม่ตรงกัน' })
        }

        const code = sendEmail.genCode()
        await sendEmail.sendMailToVerify(email)

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await userModel.createUser(username, email, hashedPassword, code)
        const codeVer = jwt.sign({code: code}, process.env.SECRET as string, { expiresIn: '30m'})
            res.cookie('code', codeVer, {
                maxAge: 0.5*60*60*1000,
                secure: true,
                httpOnly: true,
                sameSite: 'none',
        })
        
        return res.status(200).json({
            type: 'success',
            message: 'ลงทะเบียนสำเร็จ',
            redirectTo: '/verifyUser',
        })

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Registration failed' })
    }
}

export const verifyUser = async (req: Request, res: Response) => {
    const code = req.cookies.code
    const verCode = jwt.verify(code, process.env.SECRET as string)
    const getCode = await userModel.Verify(verCode.code)
    try {
        if (!getCode) {
            return res.status(400).json({
                type: 'error',
                message: 'ยืนยันตัวตนไม่ถูกต้อง',
            })
        } else {
            await userModel.updateVerifyCodeTonull(getCode.id)
            await userModel.updateStatusTo0(getCode.id)
            res.clearCookie('code')
            return res.status(200).json({
                type: 'success',
                message: 'Update สำเร็จ',
                redirectTo: '/login',
            }) 

            
        }
    
        
    } catch (error) {
        console.error('Verify user error!', error)
        return res.status(500).json({ error: 'Verify user error!' })
    }
}

export const sendNewCode = async (req: Request, res: Response) => {
    const findUser = await userModel.userById(req.session.userid)
    const email = findUser?.email as string
    const code = sendEmail.genCode()
    await sendEmail.sendMailToVerify(email)
    await userModel.updateVerifyCode(req.session.userid, code)

    return res.status(200).json({
        type: 'success',
        message: 'Update code สำเร็จ',
    })
}

export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body

    try {
        const findUser = await userModel.getUsername(username)
        
        if (!findUser) {
            return res.status(400).json({
                type: 'error',
                message: 'Username หรือ Password ไม่ถูกต้อง',
            })
        }

        if (findUser.verified_code != null) {
            return res.status(400).json({
                type: 'error',
                message: 'กรุณายืนยันตัวตน!!',
                redirectTo: '/verifyUser',
            })
        }

       const compare = await bcrypt.compare(password, findUser.password)

        if (!compare) {
            return res.status(400).json({
                type: 'error',
                message: 'Password ไม่ถูกต้อง',
             })
        } else {
            await userModel.updateTimeUser(username)
            await userModel.updateStatusTo1(username)

            const token = jwt.sign({id: findUser.id}, process.env.SECRET as string, { expiresIn: '24h'})
            res.cookie('token', token, {
                maxAge: 24*60*60*1000,
                secure: true,
                httpOnly: true,
                sameSite: 'none',
            })

            res.status(200).json({
                type: 'success',
                message: 'เข้าสู่ระบบสำเร็จ',
                //token,
                redirectTo: '/webpage',
            })
        }

    } catch (error) {
        console.error('Login error: ', error);
        return res.status(500).json({ error: 'Login failed' })
    }

}

export const logoutUser = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)
        await userModel.updateStatusTo0(user.id)
        res.clearCookie('token')
        return res.status(200).json({
            type: 'success',
            message: 'ออกจากระบบสำเร็จ',
            redirectTo: '/login',
        }) 
        
        
    } catch (error) {
        console.error('Logout error: ', error)
        return res.status(500).json({ error: 'Logout failed' })
    }
}

export const forgetPass = async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        const findUser = await userModel.getEmail(email)
        if (!findUser) {
            return res.status(500).json({ error: 'No user' }) 
        }
        const forgetPassToken = jwt.sign({id: findUser.id}, process.env.SECRET as string, { expiresIn: '24h'})
        res.cookie('token', forgetPassToken, {
            maxAge: 24*60*60*1000,
            secure: true,
            httpOnly: true,
            sameSite: 'none',
        })

        await sendEmail.sendMailToForget(email)

        return res.status(200).json({
            type: 'success',
            message: 'Send email success',
            redirectTo: '/....',
        })
        
    } catch (error) {
        console.error('Forget password error: ', error)
        return res.status(500).json({ error: 'Forget password error' })
    }
}

export const newPassword = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.forgetPassToken
        const user = jwt.verify(token, process.env.SECRET as string)
        const { password } = req.body
        const hashedPassword = await bcrypt.hash(password,10)
        const updatePass = await userModel.updatePassUser(user.id, hashedPassword)
        if (!updatePass) {
            res.clearCookie('forgetPassToken')
            return res.status(400).json({ error: 'Update password error'})
        }
        res.clearCookie('forgetPassToken')
        return res.status(200).json({
            type: 'success',
            message: 'Update password สำเร็จ',
            redirectTo: '/login',
        }) 
        
    } catch (error) {
        console.error('Forget password error: ', error)
        return res.status(500).json({ error: 'Forget password ERROR' })
    }
}

export const testSession = async (req: Request, res: Response) => {
    try {
        
        console.log('test',req.session.id)
        return res.status(200).json({
            message: req.session.userid
        })
        
    } catch (error) {
        console.error('......', error)
        return res.status(500).json({ error: '......' })
    }
}
