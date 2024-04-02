import { Request, Response } from "express"
import * as projectModel from '../models/projectModel'
import * as userModel from '../models/userModel'
import * as imageModel from '../models/imageModel'
const jwt = require('jsonwebtoken')

export const createProject = async (req: Request, res: Response) => {
    const { project_name, description } = req.body
    const token = req.cookies.token
    const user = jwt.verify(token, process.env.SECRET as string)
    try {
        
        const checkName = await projectModel.getAllprojectByname(user.id, project_name, 1)
        console.log(checkName[0])
        if (checkName[0]) {
            return res.status(500).json({ error: 'This name is already in use.' })
        }
        const dir = await imageModel.createFolder(project_name)
        const create = await projectModel.createProject(project_name, description, dir)
        const userin = await projectModel.user_in_charge(user.id, create.idproject, 1)
        if(!userin) {
            return res.status(500).json({ error: 'create project failed' })
        }

        return res.status(200).json({
            type: 'success',
            message: 'สร้าง project สำเร็จ',
            redirectTo: '/.....',
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create project ERROR!!' })
    }
}

export const createShareProject = async (req: Request, res: Response) => {
    const { project_name, username } = req.body
    const token = req.cookies.token
    const userToken = jwt.verify(token, process.env.SECRET as string)

    try {
        const user = await userModel.getUsername(username)
        const project = await projectModel.getAllprojectByname(userToken.id, project_name, 1)
        const createShare = await projectModel.user_in_charge(user?.id, project[0].idproject, 2)

        if(!createShare) {
            return res.status(500).json({ error: 'create share failed' })
        }

        return res.status(200).json({
            type: 'success',
            message: 'สร้าง share project สำเร็จ',
            redirectTo: '/.....',
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create share ERROR!!' })
    }
}

export const getAllproject = async (req: Request, res: Response) => {
    const token = req.cookies.token
    const user = jwt.verify(token, process.env.SECRET as string)
    const project = await projectModel.getAllproject(user.id, 1)

    console.log(project)
    return res.json(project)
} 

export const getShareproject = async (req: Request, res: Response) => {
    const token = req.cookies.token
    const user = jwt.verify(token, process.env.SECRET as string)
    const project = await projectModel.getAllproject(user.id, 2)

    console.log(project)
    return res.json(project)
} 

export const uploadImage = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)
        const files = req.files as Express.Multer.File[]
        const { project_name } = req.body
        
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No image uploaded' })
        }
        const data_project = await projectModel.getProjectByname(user.id, project_name)
        const dir = data_project[0].root_path as string
        
        const ress = imageModel.saveImage(dir,files)

        if(!ress){
            return res.status(400).json({
                type: 'error',
                message: 'upload image fail'
        })
        }
        return res.status(200).json({
                type: 'success',
                message: 'upload image success'
        })
    } catch (error) {
        console.error('Error uploading images:', error);
        return res.status(500).json({
            type: 'error',
            message: 'Internal server error'
        })
    }
    
}