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
                message: 'get users failed'
        })
        }
        return res.status(200).json({
                type: 'success',
                message: 'get users success',
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
                message: 'get user failed'
        })
        }
        return res.status(200).json({
                type: 'success',
                message: 'get user success',
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
            message:'Invalid username',
        })
    }

    if (!validEmail) {
        return res.status(400).json({ 
            type: 'failed',
            Attribute: 'email',
            message: 'Invalid email',
        })
    }

    if (!validPass) {
        return res.status(400).json({ 
            type: 'failed',
            Attribute: 'password',
            message: 'The password is incorrect.',
        })
    }

    try {
        const checkUser = await userModel.getUsername(username)

        if (checkUser) {
            return res.status(400).json({ 
                type: 'failed',
                Attribute: 'username',
                message: 'Username is already in use', 
            })
        }

        const checkEmail = await userModel.getEmail(email)

        if (checkEmail) {
            return res.status(400).json({ 
                type: 'failed',
                Attribute: 'email',
                message: 'Email is already in use.',
            })
        }

        if (conPassword != password){
            return res.status(400).json({ 
                type: 'failed',
                Attribute: 'password',
                message: 'Passwords are inconsistent.',
            })
        }

        const code = sendEmail.genCode()
        await sendEmail.sendMailToVerify(email)

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
            message: 'Successfully registered',
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
                message: 'Verified is not correctly',
            })
        } else {
            await userModel.updateVerifyCodeTonull(getCode.id)
            await userModel.updateStatusTo0(getCode.id)
            res.clearCookie('code')
            return res.status(200).json({
                type: 'success',
                message: 'Verify success',
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
            message: 'Update code success',
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
                message: 'Invalid username',
            })
        }

        if (findUser.status == -1) {
            return res.status(400).json({
                type: 'verify',
                id: findUser.id,
                message: 'Please verify.',
            })
        }

       const compare = await bcrypt.compare(password, findUser.password)

        if (!compare) {
            return res.status(400).json({
                type: 'failed',
                Attribute: 'password',
                message: 'Password is incorrect',
             })
        } else {
            await userModel.updateTimeUser(username)
            await userModel.updateStatusTo1(username)

            const token = jwt.sign({id: findUser.id, username: findUser.username}, process.env.SECRET as string, { expiresIn: '72h'})
            res.cookie('token', token, {
                maxAge: 72*60*60*1000,
                secure: true,
                httpOnly: true,
                sameSite: 'none',
            })

            res.status(200).json({
                type: 'success',
                message: 'Login successful',
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
            message: 'Log out successfully',
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

        //await sendEmail.sendMailToForget(email)

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
            message: 'Update password success',
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
            message: 'Username value sent successfully.',
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
