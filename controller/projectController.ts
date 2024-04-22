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
        const dir = await projectModel.createFolder(project_name, user.username)
        const create = await projectModel.createProject(project_name, description, dir)
        const userin = await projectModel.user_in_charge(user.id, create.idproject, 1)
        if(!userin) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'สร้าง project ล้มเหลว', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'สร้าง project สำเร็จ',
            create,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create project ERROR!!' })
    }
}


export const createShareProject = async (req: Request, res: Response) => {
    const idproject = parseInt(req.body.idproject)
    const username = req.body.username
    try {
        const user = await userModel.getUsername(username)
        const createShare = await projectModel.user_in_charge(user?.id, idproject, 2)

        if(!createShare) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'สร้าง share project ล้มเหลว', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'สร้าง share project สำเร็จ',
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'create share ERROR!!' })
    }
}

export const getAllproject = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)
        const project = await projectModel.getAllproject(user.id, 1)

        if(!project) {
            return res.status(400).json({ 
                type: 'failed',
                message: 'get project ล้มเหลว', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get project สำเร็จ',
            project,
        })
            
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'get all project ERROR!!' })
    }
    
} 

export const getprojectById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    try {
        const project = await projectModel.getprojectById(id)

        if(!project) {
            return res.status(400).json({ 
                type: 'failed',
                message: 'get project ล้มเหลว', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get project สำเร็จ',
            project,
            
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'get project by id ERROR!!' })
    }
    
} 

export const getShareproject = async (req: Request, res: Response) => {
    const token = req.cookies.token
    const user = jwt.verify(token, process.env.SECRET as string)

    try {
        const project = await projectModel.getAllproject(user.id, 2)

        if(!project) {
            return res.status(400).json({ 
                type: 'failed',
                message: 'get share project ล้มเหลว', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get share project สำเร็จ',
            project,
            
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'get share project ERROR!!' })
    }
    
} 

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const data_project = await projectModel.getprojectById(idproject)
        const delUser_in_charge = projectModel.deleteUser_in_charge(idproject)
        const delproject = projectModel.deleteProject(idproject)

        const dir = data_project?.root_path as string
        const delFolder = projectModel.deleteFolder(dir)

        if(!delUser_in_charge || !delproject) {
            return res.status(400).json({ 
                type: 'failed',
                message: 'delete project ล้มเหลว', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get share project สำเร็จ',
            delUser_in_charge,
            delproject,
            delFolder,
            
        })
        
    } catch (error) {
        
    }
}

export const uploadImage = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[]
        const idproject = parseInt(req.body.idproject)
        
        if (!files || files.length === 0) {
            return res.status(400).json({ 
                type: 'failed',
                message: 'No image uploaded'
            })
        }
        const data_project = await projectModel.getprojectById(idproject)
        const dir = data_project?.root_path as string
        
        const ress = imageModel.saveImage(dir, files)

        if(!ress){
            return res.status(400).json({
                type: 'failed',
                message: 'upload image fail'
        })
        }
        return res.status(200).json({
                type: 'success',
                message: 'upload image success'
        })
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'upload image ERROR!!' })
    }
    
}

export const pullImage = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const data_project = await projectModel.getprojectById(idproject)
        const dir = data_project?.root_path as string

        const imageFile = await imageModel.pullallImage(dir)

        if(!imageFile) {
            return res.status(400).json({ 
                type: 'failed',
                message: 'get images ล้มเหลว', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get images สำเร็จ',
            imageFile,
            
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'pull images ERROR!!' })
    }
}