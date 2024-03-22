import { Request, Response } from "express"
import * as userModel from '../models/userModel'
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
        //await sendEmail.sendMail(email,code)

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await userModel.createUser(username, email, hashedPassword, code)
        req.session.userid = newUser.id
        
        return res.status(200).json({
            type: 'Success!!',
            message: 'ลงทะเบียนสำเร็จ',
            redirectTo: '/verifyUser',
        })

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Registration failed' })
    }
}

export const verifyUser = async (req: Request, res: Response) => {
    const { verifiedCode } = req.body
    const code = await userModel.userById(req.session.userid)
    try {
        if (code?.verified_code != verifiedCode) {
            return res.status(400).json({
                type: 'Error!!',
                message: 'รหัสยืนยันไม่ถูกต้อง',
            })
        } else {
            await userModel.updateVerifyCode(req.session.userid)
            await userModel.updateStatusTo0(req.session.userid)
            req.session.destroy(() => {
                return res.status(200).json({
                    type: 'Success!!',
                    message: 'Update สำเร็จ',
                    redirectTo: '/login',
                }) 
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

        if (findUser.verified_code != null) {
            req.session.userid = findUser.id
            return res.status(400).json({
                type: 'Error!!',
                message: 'กรุณายืนยันตัวตน!!',
                redirectTo: '/verifyUser',
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

            req.session.userid = findUser.id
            
            return res.status(200).json({
                type: 'Success!!',
                message: 'เข้าสู่ระบบสำเร็จ',
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
        
        await userModel.updateStatusTo0(req.session.userid)
        req.session.destroy(() => {
            return res.status(200).json({
                type: 'Success!!',
                message: 'ออกจากระบบสำเร็จ',
                redirectTo: '/login',
            }) 
        })
        
    } catch (error) {
        console.error('Logout error: ', error)
        return res.status(500).json({ error: 'Logout failed' })
    }
}
/*
export const testUser = async (req: Request, res: Response) => {
    try {
        res.send('Test !!!<br>' + req.session.userid + '<br><br>' + req.session.username + '<br>')
        
    } catch (error) {
        console.error('Logout error: ', error)
        return res.status(500).json({ error: 'Logout failed' })
    }
}

export const setUser = async (req: Request, res: Response) => {
    try {
        req.session.userid = 20
        req.session.username = "good"
        res.send('SETUSER!!!')
        console.log(req.session.userid)
        
    } catch (error) {
        console.error('Logout error: ', error)
        return res.status(500).json({ error: 'Logout failed' })
    }
}

export const delUser = async (req: Request, res: Response) => {
    try {
        res.send('delete')
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Error destroying session');
            } else {
                res.send('Session cookie destroyed');
            }
        });
        console.log(req.session.userid)
        
    } catch (error) {
        console.error('Logout error: ', error)
        return res.status(500).json({ error: 'Logout failed' })
    }
}*/