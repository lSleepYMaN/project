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

export const getAllDetection = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.params.idproject)
        const detection = await detectionModel.getAllDetection(idproject)

        if(!detection) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'get all label ล้มเหลว', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get all label สำเร็จ',
            detection,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get all detection ERROR!!' })
    }
}

export const createBounding_box = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)
        const iddetection = parseInt(req.body.iddetection)
        const bounding_box = req.body.bounding_box
        let length = bounding_box.length
        
        for(let i = 0; i < length; i++){
            const saveBounding_box = await detectionModel.createBounding_box(bounding_box[i].x1,bounding_box[i].x2
                                                                                 ,bounding_box[i].y1,bounding_box[i].y2
                                                                                 ,iddetection,bounding_box[i].class_id
                                                                                 ,user.id) 
            }
            return res.status(200).json({
                type: 'success',
                message: 'สร้าง bounding box สำเร็จ',

         })
        

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create bounding box ERROR!!' })
    }
} 

export const getBounding_box = async (req: Request, res: Response) => {
    try {
        const iddetection = parseInt(req.body.iddetection)
        const data = await detectionModel.getBounding_box(iddetection)

        if (data.length == 0) {
            return res.status(200).json({
                type: 'failed',
                message: 'ไม่มี bounding box ในรูปภาพนี้',

            })
        }
        return res.status(200).json({
            type: 'success',
            message: 'get bounding box สำเร็จ',
            detection: iddetection,
            bounding_box: data,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get bounding box ERROR!!' })
    }
}

export const updateBounding_box = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)
        const bounding_box = req.body.bounding_box
        let length = bounding_box.length

        for(let i = 0; i < length; i++) {
            const update = detectionModel.updateBounding_box(bounding_box[i].idbounding_box,bounding_box[i].x1
                                                            ,bounding_box[i].x2,bounding_box[i].y1
                                                            ,bounding_box[i].y2,bounding_box[i].class_id
                                                            ,user.id
                                                            )
        }
        return res.status(200).json({
            type: 'success',
            message: 'update bounding box สำเร็จ',

        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'update bounding box ERROR!!' })
    }
}

export const delBounding_box = async (req: Request, res: Response) => {
    try {
        const idbounding_box = req.body.idbounding_box
        
        for(let i = 0; i < idbounding_box.length; i++){
            const data = await detectionModel.getBounding_box_by_id(idbounding_box[i])
            if (data == null) {
                return res.status(200).json({
                    type: 'failed',
                    idbounding_box: idbounding_box[i],
                    message: 'bounding box ไม่มีในระบบ',

                })
            }
            const del = await detectionModel.delBounding_box(idbounding_box[i]) 
            console.log(del)
            if (!del) {
                return res.status(200).json({
                    type: 'failed',
                    idbounding_box: idbounding_box[i],
                    message: 'delete bounding box ไม่สำเร็จ',

                })
            }
        }

        return res.status(200).json({
            type: 'success',
            message: 'delete bounding box สำเร็จ',

        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'delete bounding box ERROR!!' })
    }
}