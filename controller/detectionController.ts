import { Request, Response } from "express"
import * as projectModel from '../models/projectModel'
import * as userModel from '../models/userModel'
import * as imageModel from '../models/imageModel'
import * as detectionModel from '../models/detectionModel'
const jwt = require('jsonwebtoken')

export const createDetectionClass = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const class_label = req.body.class_label

        const checkName = await detectionModel.getlabelName(idproject, class_label)
        console.log(checkName)
        if (checkName[0]) {
            return res.status(500).json({ error: 'This label is already in use.' })
        }

        const create = await detectionModel.createClass(class_label, idproject)

        if(!create) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'สร้าง label ล้มเหลว', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'สร้าง label สำเร็จ',
            create,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create detection class ERROR!!' })
    }
}

export const getAllClass = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const label = await detectionModel.getAllLabel(idproject)

        if(!label) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'get all label ล้มเหลว', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get all label สำเร็จ',
            label,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get all detection class ERROR!!' })
    }
}

export const createDetection = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const imageName = req.body.imageName as string
        const data_project = await projectModel.getprojectById(idproject)
        const dir = data_project?.root_path as string

        const create = await detectionModel.createDetection(dir, imageName, idproject)

        if(!create) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'สร้าง detection ล้มเหลว', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'สร้าง detection สำเร็จ',
            create,
        })


        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create detection ERROR!!' })
    }
} 