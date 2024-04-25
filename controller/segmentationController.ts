import { Request, Response } from "express"
import * as projectModel from '../models/projectModel'
import * as userModel from '../models/userModel'
import * as imageModel from '../models/imageModel'
import * as segmentationModel from '../models/segmentationModel'
const jwt = require('jsonwebtoken')

export const createSegmentationClass = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const class_label = req.body.class_label

        const checkName = await segmentationModel.getlabelName(idproject, class_label)
        console.log(checkName)
        if (checkName[0]) {
            return res.status(500).json({ error: 'This label is already in use.' })
        }

        const create = await segmentationModel.createClass(class_label, idproject)

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
        return res.status(500).json({ error: 'create segmentation class ERROR!!' })
    }
}

export const getAllClass = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const label = await segmentationModel.getAllLabel(idproject)

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
        return res.status(500).json({ error: 'get all segmentation class ERROR!!' })
    }
}

export const getAllSegmentation = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const segmentation = await segmentationModel.getAllSegmentation(idproject)

        if(!segmentation) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'get all label ล้มเหลว', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get all label สำเร็จ',
            segmentation,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get all segmentation ERROR!!' })
    }
}

export const createPolygon = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)
        const idsegmentation = parseInt(req.body.idsegmentation)
        const polygon = req.body.polygon
        let length = polygon.length
        
        for(let i = 0; i < length; i++){
            const saveBounding_box = await segmentationModel.createPolygon(polygon[i].xy_polygon, idsegmentation
                                                                            ,polygon[i].class_id,user.id) 
            }
            return res.status(200).json({
                type: 'success',
                message: 'สร้าง polygon สำเร็จ',

        })
        

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create polygon ERROR!!' })
    }
}

export const getPolygon = async (req: Request, res: Response) => {
    try {
        const idsegmentation = parseInt(req.body.idsegmentation)
        const data = await segmentationModel.getPolygon(idsegmentation)

        if (data.length == 0) {
            return res.status(200).json({
                type: 'failed',
                message: 'ไม่มี polygon ในรูปภาพนี้',

            })
        }
        return res.status(200).json({
            type: 'success',
            message: 'get polygon สำเร็จ',
            detection: idsegmentation,
            bounding_box: data,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get polygon ERROR!!' })
    }
}

export const updatePolygon = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)
        const polygon = req.body.polygon
        let length = polygon.length

        for(let i = 0; i < length; i++) {
            const update = segmentationModel.updatePolygon(polygon[i].idpolygon, polygon[i].xy_polygon
                                                            ,polygon[i].class_id, user.id)
        }
        return res.status(200).json({
            type: 'success',
            message: 'update polygon สำเร็จ',

        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'update polygon ERROR!!' })
    }
}

export const delpolygon = async (req: Request, res: Response) => {
    try {
        const idpolygon = req.body.idpolygon
        
        for(let i = 0; i < idpolygon.length; i++){
            const data = await segmentationModel.getPolygon_by_id(idpolygon[i])
            if (data == null) {
                return res.status(200).json({
                    type: 'failed',
                    idpolygon: idpolygon[i],
                    message: 'polygon ไม่มีในระบบ',

                })
            }
            const del = await segmentationModel.delPolygon(idpolygon[i]) 
            console.log(del)
            if (!del) {
                return res.status(200).json({
                    type: 'failed',
                    idpolygon: idpolygon[i],
                    message: 'delete polygon ไม่สำเร็จ',

                })
            }
        }

        return res.status(200).json({
            type: 'success',
            message: 'delete polygon สำเร็จ',

        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'delete polygon ERROR!!' })
    }
}