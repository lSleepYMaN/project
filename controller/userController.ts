import { Request, Response } from "express"
import * as userModel from '../models/userModel'
import bcrypt from 'bcryptjs'
import * as sendEmail from '../utils/sendEmail'
const jwt = require('jsonwebtoken')

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userModel.allUser()
        if(!users){
            return res.status(400).json({
                type: 'failed',
                message: 'get users ล้มเหลว'
        })
        }
        return res.status(200).json({
                type: 'success',
                message: 'get users สำเร็จ',
                users
        })
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'get all users ERROR!!' })
    }
}

export const getUserById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    try {
        const user = await userModel.userById(id)
        if(!user){
            return res.status(400).json({
                type: 'failed',
                message: 'get user ล้มเหลว'
        })
        }
        return res.status(200).json({
                type: 'success',
                message: 'get user สำเร็จ',
                user
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'get user by id ERROR!!' })
    }
}

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password, conPassword } = req.body
    const validUsername = /^[a-zA-Z0-9_]{8,}$/.test(username)
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const validPass = /^.{8,}$/.test(password)
    
    if(!validUsername){
        return res.status(400).json({
            type: 'failed',
            Attribute: 'username',
            message:'ชื่อผู้ใช้ไม่ถูกต้อง',
        })
    }

    if (!validEmail) {
        return res.status(400).json({ 
            type: 'failed',
            Attribute: 'email',
            message: 'อีเมลล์ไม่ถูกต้อง',
        })
    }

    if (!validPass) {
        return res.status(400).json({ 
            type: 'failed',
            Attribute: 'password',
            message: 'รหัสผ่านไม่ถูกต้อง',
        })
    }

    try {
        const checkUser = await userModel.getUsername(username)

        if (checkUser) {
            return res.status(400).json({ 
                type: 'failed',
                Attribute: 'username',
                message: 'ชื่อผู้ใช้ถูกใช้งานแล้ว', 
            })
        }

        const checkEmail = await userModel.getEmail(email)

        if (checkEmail) {
            return res.status(400).json({ 
                type: 'failed',
                Attribute: 'email',
                message: 'อีเมลล์ถูกใช้งานแล้ว',
            })
        }

        if (conPassword != password){
            return res.status(400).json({ 
                type: 'failed',
                Attribute: 'password',
                message: 'รหัสผ่านไม่สอดคล้องกัน',
            })
        }

        const code = sendEmail.genCode()
        //await sendEmail.sendMailToVerify(email)

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await userModel.createUser(username, email, hashedPassword, code)
        // const codeVer = jwt.sign({code: code}, process.env.SECRET as string, { expiresIn: '30m'})
        //     res.cookie('code', codeVer, {
        //         maxAge: 0.5*60*60*1000,
        //         secure: true,
        //         httpOnly: true,
        //         sameSite: 'none',
        // })
        
        return res.status(200).json({
            type: 'success',
            message: 'ลงทะเบียนสำเร็จ',
        })

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(400).json({ error: 'Registration failed' })
    }
}

export const verifyUser = async (req: Request, res: Response) => {
    const code = req.cookies.code
    const verCode = jwt.verify(code, process.env.SECRET as string)
    const getCode = await userModel.Verify(verCode.code)
    try {
        if (!getCode) {
            return res.status(400).json({
                type: 'failed',
                message: 'ยืนยันตัวตนไม่ถูกต้อง',
            })
        } else {
            await userModel.updateVerifyCodeTonull(getCode.id)
            await userModel.updateStatusTo0(getCode.id)
            res.clearCookie('code')
            return res.status(200).json({
                type: 'success',
                message: 'Verify สำเร็จ',
            }) 
 
        }
    
    } catch (error) {
        console.error('Verify user error!', error)
        return res.status(400).json({ error: 'Verify user ERROR!!' })
    }
}

export const sendNewCode = async (req: Request, res: Response) => {
    const findUser = await userModel.userById(req.session.userid)
    const email = findUser?.email as string
    const code = sendEmail.genCode()
    try {
        await sendEmail.sendMailToVerify(email)
        await userModel.updateVerifyCode(req.session.userid, code)

        return res.status(200).json({
            type: 'success',
            message: 'Update code สำเร็จ',
        })
    } catch (error) {
        console.error('Verify user error!', error)
        return res.status(400).json({ error: 'send new code ERROR!!' })
    }
    
}

export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body

    try {
        const findUser = await userModel.getUsername(username)
        
        if (!findUser) {
            return res.status(400).json({
                type: 'failed',
                Attribute: 'username',
                message: 'ชื่อผู้ใช้ไม่ถูกต้อง',
            })
        }

        if (findUser.verified_code != null) {
            return res.status(400).json({
                type: 'failed',
                message: 'กรุณายืนยันตัวตน!!',
            })
        }

       const compare = await bcrypt.compare(password, findUser.password)

        if (!compare) {
            return res.status(400).json({
                type: 'failed',
                Attribute: 'password',
                message: 'Password ไม่ถูกต้อง',
             })
        } else {
            await userModel.updateTimeUser(username)
            await userModel.updateStatusTo1(username)

            const token = jwt.sign({id: findUser.id, username: findUser.username}, process.env.SECRET as string, { expiresIn: '24h'})
            res.cookie('token', token, {
                maxAge: 24*60*60*1000,
                secure: true,
                httpOnly: true,
                sameSite: 'none',
            })

            res.status(200).json({
                type: 'success',
                message: 'เข้าสู่ระบบสำเร็จ',
            })
        }

    } catch (error) {
        console.error('Login error: ', error);
        return res.status(400).json({ error: 'Login failed' })
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
        }) 
        
        
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'logout ERROR!!' })
    }
}

export const forgetPass = async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        const findUser = await userModel.getEmail(email)
        if (!findUser) {
            return res.status(500).json({
                type: 'failed',
                message: 'No user' 
            }) 
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
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'forget password ERROR!!' })
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
            return res.status(400).json({ 
                type: 'failed',
                message: 'Update password error'
            })
        }
        res.clearCookie('forgetPassToken')
        return res.status(200).json({
            type: 'success',
            message: 'Update password สำเร็จ',
        }) 
        
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'new password ERROR!!' })
    }
}

export const returnUsername = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)

        return res.status(200).json({
            type: 'success',
            message: 'ส่งค่า username สำเร็จ',
            username: user.username,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'return Username ERROR!!' })
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
