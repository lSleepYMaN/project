import { Request, Response } from "express"
import * as userModel from '../models/userModel'
import bcrypt from 'bcryptjs'
import * as sendEmail from '../utils/sendEmail'
import jwt, { verify } from 'jsonwebtoken'

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
    
    if(!validUsername){
        return res.status(400).json({ error: 'Username ไม่ตรงตามเงื่อนไข'})
    }

    if (!validEmail) {
        return res.status(400).json({ error: 'Email ไม่ถูกต้อง'})
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
        await sendEmail.sendMail(email,code)

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await userModel.createUser(username, email, hashedPassword, code)

        const token = jwt.sign(
            { id: newUser.id, username}, "test123", { expiresIn: "2h" }
        )

        return res.status(200).json({
            type: 'Success!!',
            message: 'ลงทะเบียนสำเร็จ',
            redirectTo: '/verifyUser',
            user_data: token,
        })

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Registration failed' })
    }
}

export const verifyUser = async (req: Request, res: Response) => {
    const token = req.headers['authorization']
    const { verifiedCode } = req.body
    let authToken = ''
    if (token) {
        authToken = token.split(' ')[1]
    }
    const user = jwt.verify(authToken, 'test123') as {username: string}
    const verified = await userModel.getUsername(user.username)
    try {
        if (verified?.verified_code != verifiedCode) {
            return res.status(400).json({
                type: 'Error!!',
                message: 'รหัสยืนยันไม่ถูกต้อง',
            })
        } else {
            await userModel.updateVerifyCode(user.username)
            await userModel.updateStatusTo0(user.username)
            return res.status(200).json({
                type: 'Success!!',
                message: 'Update สำเร็จ',
                redirectTo: '/login',
            })
        }
    
        
    } catch (error) {
        console.error('Verify user ERROR!!!', error)
        return res.status(500).json({ error: 'Verify user ERROR!!!' })
    }
}

export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body

    try {
        const findUser = await userModel.getUsername(username)
        
        if (!findUser) {
            return res.status(400).json({
                type: 'Error!!',
                message: 'Username หรือ Password ไม่ถูกต้อง',
            })
        }

       const compare = await bcrypt.compare(password, findUser.password)

        if (!compare) {
            return res.status(400).json({
                type: 'Error!!',
                message: 'Password ไม่ถูกต้อง',
             })
        } else {
            await userModel.updateTimeUser(username)
            await userModel.updateStatusTo1(username)

            const token = jwt.sign(
                { id: findUser.id, username}, "test123", { expiresIn: "72h" }
            )
            
            return res.status(200).json({
                type: 'Success!!',
                message: 'เข้าสู่ระบบสำเร็จ',
                redirectTo: '/webpage',
                user_data: token,
            })
        }

    } catch (error) {
        console.error('Login error: ', error);
        return res.status(500).json({ error: 'Login failed' })
    }

}

export const logoutUser = async (req: Request, res: Response) => {
    try {
        const token = req.headers['authorization']
        let authToken = ''
    
        if (token) {
            authToken = token.split(' ')[1]
        }
        const user = jwt.verify(authToken, 'test123') as {username: string}
        await userModel.updateStatusTo0(user.username)
        return res.status(200).json({
            type: 'Success!!',
            message: 'ออกจากระบบสำเร็จ',
            redirectTo: '/login',
            user_data: authToken,
        })
        
    } catch (error) {
        console.error('Logout error: ', error)
        return res.status(500).json({ error: 'Logout failed' })
    }
}