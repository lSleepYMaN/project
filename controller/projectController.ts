import { Request, Response } from "express"
import * as projectModel from '../models/projectModel'
import * as userModel from '../models/userModel'
import * as imageModel from '../models/imageModel'
import * as detectionModel from '../models/detectionModel'
import * as segmentationModel from '../models/segmentationModel'
import path from "path";
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
        
        const create = await projectModel.createProject(project_name, description)
        const update = await projectModel.root_pathUP(create.idproject)
        const dir = await projectModel.createFolder(create.idproject)
        const userin = await projectModel.user_in_charge(user.id, create.idproject, 1)
        if(!userin) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'create project failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'create project success',
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
                message: 'create share project failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'create share project success',
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
                message: 'get project failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get project success',
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
                message: 'get project failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get project success',
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
                message: 'get share project failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get share project success',
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
        if (data_project == null) {
            return res.status(400).json({ 
                type: 'failed',
                message: 'project not found', 
            })
        }
        const delUser_in_charge = await projectModel.deleteUser_in_charge(idproject)
        const getdetection = await detectionModel.getAllDetection(idproject)
        const getsegmentation = await segmentationModel.getAllSegmentation(idproject)
        for(let i = 0; i < getdetection.length; i++){
            const getBounding_box = await detectionModel.getBounding_box(getdetection[i].iddetection)
            if (getBounding_box.length != 0) {
                await detectionModel.delBounding_box_by_detection(getdetection[i].iddetection)
            }
            
        }

        for(let i = 0; i < getsegmentation.length; i++){
            const getPolygon = await segmentationModel.getPolygon(getsegmentation[i].idsegmentation)
            if (getPolygon.length != 0) {
                await segmentationModel.delPolygon_by_segmentation(getsegmentation[i].idsegmentation)
            }
            
        }
        
        const delproject = await projectModel.deleteProject(idproject)

        const dir = data_project?.root_path as string
        const delFolder = await projectModel.deleteFolder(dir)

        if(!delUser_in_charge || !delproject) {
            return res.status(400).json({ 
                type: 'failed',
                message: 'delete project failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'delete project success',
            
        })
        
    } catch (error) {
        
    }
}

export const uploadImage = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[]
        const idproject = parseInt(req.body.idproject)
        const type = req.body.type as string
        
        if (!files || files.length === 0) {
            return res.status(400).json({ 
                type: 'failed',
                message: 'No image uploaded'
            })
        }

        if (type == null) {
            return res.status(400).json({ 
                type: 'failed',
                message: 'Unable to specify save format'
            })
        }
        
        const ress = await imageModel.saveImage(idproject, files, type)
        
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

export const getImg = async (req: Request, res:Response) => {
    try {
        const idproject = req.body.idproject
        const Imgname = req.body.imgname
        res.sendFile(path.join(__dirname, '../project_path', idproject, 'images', Imgname));
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get Img ERROR!!' })
    }
}
