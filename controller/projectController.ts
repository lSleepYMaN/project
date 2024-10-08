import { Request, Response } from "express"
import * as projectModel from '../models/projectModel'
import * as userModel from '../models/userModel'
import * as imageModel from '../models/imageModel'
import * as detectionModel from '../models/detectionModel'
import * as segmentationModel from '../models/segmentationModel'
import * as classificationModel from '../models/classificationModel'
import path from "path";
import fs from 'fs'
const jwt = require('jsonwebtoken')

export const createProject = async (req: Request, res: Response) => {
    const { project_name, description } = req.body
    const token = req.cookies.token
    const user = jwt.verify(token, process.env.SECRET as string)
    try {

        if (project_name.length == 0 || description.length == 0) {
            return res.status(500).json({ error: 'Name or description is incorrect.' })
        }
        
        const checkName = await projectModel.getAllprojectByname(user.id, project_name, 1)
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

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { project_name, description } = req.body
        const idproject = parseInt(req.body.idproject)
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)

        if (project_name.length == 0 || description.length == 0) {
            return res.status(500).json({ error: 'Name or description is incorrect.' })
        }

        const checkName = await projectModel.getAllprojectByname(user.id, project_name, 1)
        console.log(checkName[0])
        if (checkName[0]) {
            return res.status(500).json({ error: 'This name is already in use.' })
        }

        const update = await projectModel.updateProject(idproject, project_name, description)

        if(!update) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'update project failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'update project success',
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'update project ERROR!!!' })
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
        const index_length = await classificationModel.getAllClass(idproject)
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
        const delFolder = await projectModel.deleteFolder(dir, index_length.length)

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
        
        if (!files || files.length === 0) {
            return res.status(400).json({ 
                type: 'failed',
                message: 'No image uploaded'
            })
        }
        
        const result = await imageModel.saveImage(idproject, files)
        console.log(result)
        if (result !== 0) {
            if (result.data && result.imgErr.length > 0) {
                return res.status(200).json({
                    type: 'partial_success',
                    message: 'Some images were uploaded successfully, but some failed',
                    failed_files: result.imgErr
                });
            }

            return res.status(200).json({
                type: 'success',
                message: 'All images uploaded successfully'
            });

        } else {
            return res.status(400).json({
                type: 'failed',
                message: 'upload image failed'
            });
        }
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'upload image ERROR!!' })
    }
    
}

export const getImg = async (req: Request, res:Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const imgName = await imageModel.getImg(idproject)
        if(imgName == 0){
            return res.status(400).json({
                type: 'failed',
                message: 'get image fail'
            })
        }
        return res.status(200).json({
                type: 'success',
                message: 'get image success',
                imgName
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get Img ERROR!!' })
    }
}

export const delImg = async (req: Request, res:Response) => {
    try {
        const idproject = parseInt(req.body.idproject)  
        const imgName = req.body.imgName as string
        const type = req.body.type
        const index = parseInt(req.body.index)

        if (type == 'classification') {
            const deleteImg = await imageModel.delImgClassification(idproject, imgName, index)
            return res.status(200).json({
                type: 'success',
                message: 'delete image success',
                imgName
            })

        } else if (type == 'detection'|| type == 'segmentation') {
            const get_Detection = await detectionModel.getDetectionByImg(idproject, imgName)
            const get_segmentation = await segmentationModel.getSegmentationByImg(idproject, imgName)
            await detectionModel.delDetectionbyId(get_Detection[0].iddetection)
            await segmentationModel.delSegmentationbyId(get_segmentation[0].idsegmentation)
            const deleteImg = await imageModel.delImg(idproject, imgName)
            return res.status(200).json({
                type: 'success',
                message: 'delete image success',
                imgName
            })

        } else {
            return res.status(400).json({
                type: 'failed',
                message: 'type is incorrect'
            })
        }
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Delete Img ERROR!!' })
    }
}
