import { Request, Response } from "express"
import * as userModel from '../models/userModel'
import md5 from 'md5'
import bcrypt from 'bcryptjs'
import * as sendEmail from '../utils/sendEmail'

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
    
    if(!validUsername){
        return res.status(400).json({ error: 'Username ไม่ตรงตามเงื่อนไข'})
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

        const hashedPassword = md5(password)

        const newUser = await userModel.createUser(username, email, hashedPassword, code)

        return res.status(200).json({
            type: 'Success!!',
            message: 'ลงทะเบียนสำเร็จ',
            redirectTo: '/reg-log/sregister',
            user: newUser,
        })

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Registration failed' })
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

        const hashedPassword = md5(password)

        if (hashedPassword === findUser.password) {
            await userModel.updateTimeUser(username)
            return res.status(400).json({
                type: 'Success!!',
                message: 'Login สำเร็จ',
                redirectTo: '/allUsers'
            })
        } else {
            return res.status(400).json({
                type: 'Error!!',
                message: 'Password ไม่ถูกต้อง',
            })
        }


    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Login failed' })
    }

}