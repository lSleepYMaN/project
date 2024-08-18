import { Request, Response } from "express"
import * as segmentationModel from '../models/segmentationModel'
import * as detectionModel from '../models/detectionModel'
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
        const create2 = await detectionModel.createClass(class_label, idproject)

        if(!create) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'create label failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'create label success',
            create,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create segmentation class ERROR!!' })
    }
}

export const getAllClass = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.params.idproject)
        const label = await segmentationModel.getAllLabel(idproject)
        const strClass = []

        for(let i = 0; i < label.length; i++){
            strClass.push(label[i].class_label)
        }

        if(!label) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'get all label failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get all label success',
            label,
            strClass,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get all segmentation class ERROR!!' })
    }
}

export const updateClass = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const class_id = parseInt(req.body.class_id)
        const label_name = req.body.class_label
        const getLabel_name = await segmentationModel.getLabelByID(class_id)
        const check_label = await segmentationModel.getlabelName(idproject, label_name)
        if (check_label.length != 0) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'label has been used.', 
            })
        }
        const uplabel = await segmentationModel.updateClassName(class_id, label_name)
        const getDeClass = await detectionModel.getlabelName(idproject, getLabel_name[0].class_label)
        const uplabel2 = await detectionModel.updateClassName(getDeClass[0].class_id, label_name)
        if(!uplabel) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'update label failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'update label success'
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'update class ERROR!!!' })
    }
}

export const delLabel = async (req: Request, res: Response) => {
    try {
        const class_id = parseInt(req.body.class_id)
        const idproject = parseInt(req.body.idproject)
        const getLabel_name = await segmentationModel.getLabelByID(class_id)
        const check_label = await segmentationModel.getLabelByID(class_id)
        if (check_label.length == 0) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'label not found', 
            })
        }
        const getDeClass = await detectionModel.getlabelName(idproject, getLabel_name[0].class_label)
        const delclass = segmentationModel.delLabel(class_id)
        const delclass2 = detectionModel.delLabel(getDeClass[0].class_id)

        if(!delclass) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'delete label failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'delete label success'
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'delete class ERROR!!!' })
    }
}

export const getAllSegmentation = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.params.idproject)
        const segmentation = await segmentationModel.getAllSegmentation(idproject)

        if(!segmentation) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'get all label failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get all label success',
            segmentation,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get all segmentation ERROR!!' })
    }
}

export const CRUDPolygon = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)
        const idsegmentation = parseInt(req.body.idsegmentation)
        const idproject = parseInt(req.body.idproject)
        const polygon = req.body.polygon
        const check_polygon = await segmentationModel.getPolygon(idsegmentation)
        console.log(polygon)
        
        for(let i = 0; i < polygon.length; i++){
            for (let j = 0; j < check_polygon.length; j++){
                if (polygon[i].id == check_polygon[j].idpolygon) {

                    if (polygon[i].points != check_polygon[j].xy_polygon ||
                        polygon[i].class_label != check_polygon[j].label) {
    
                        const updatePolygon = await segmentationModel.updatePolygon(parseInt(polygon[i].id), polygon[i].points, polygon[i].class_label
                                                                                    ,user.id, idsegmentation, idproject)
                        check_polygon.slice(j, 1)
                        polygon.slice(i, 1)
                    } else {
                        check_polygon.slice(j, 1)
                        polygon.slice(i, 1)
                    }
    
                }
            }
        }
        for(let i = 0; i < polygon.length; i++){
            const saveBounding_box = await segmentationModel.createPolygon(polygon[i].points, idsegmentation
                                                                            ,polygon[i].class_label,user.id, idproject) 
        }
        for(let i = 0; i < check_polygon.length; i++){
            await segmentationModel.delPolygon(check_polygon[i].idpolygon)
        }
            
        return res.status(200).json({
            type: 'success',
            message: 'CRUD polygon success',
        })
        

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create polygon ERROR!!' })
    }
}

export const getPolygon = async (req: Request, res: Response) => {
    try {
        const idsegmentation = parseInt(req.params.idsegmentation)
        const data = await segmentationModel.getPolygon(idsegmentation)
        let annotation = []

        if (data.length == 0) {
            return res.status(200).json({
                type: 'failed',
                message: 'There is no polygon in this image.',

            })
        }
        for (let i = 0; i < data.length; i++) {
            annotation.push(
                {
                    "id": `${data[i].idpolygon}`,
                    "type": "Annotation",
                    "body": [
                        {
                            "type": "TextualBody",
                            "value": data[i].label[0].class_label,
                            "purpose": "tagging"
                        }
                    ],
                    "target": {
                        "selector": {
                            "type": "SvgSelector",
                            "value": `<svg><polygon points=\"${data[i].xy_polygon}\"></polygon></svg>`
                        }
                    }
                }
            )
        }
        return res.status(200).json({
            annotation
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get polygon ERROR!!' })
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
                    message: 'polygon not found',

                })
            }
            const del = await segmentationModel.delPolygon(idpolygon[i]) 
            console.log(del)
            if (!del) {
                return res.status(200).json({
                    type: 'failed',
                    idpolygon: idpolygon[i],
                    message: 'delete polygon failed',

                })
            }
        }

        return res.status(200).json({
            type: 'success',
            message: 'delete polygon success',

        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'delete polygon ERROR!!' })
    }
}

export const segmentation_to_detection = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)
        const idproject = parseInt(req.body.idproject)
        const create = await segmentationModel.segmentation_to_detection(idproject, user.id)
        console.log(`Create ${create} bounding box`)

        return res.status(200).json({
            type: 'success',
            message: 'Convert segmentation to detection success',

        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Convert segmentation to detection ERROR!!' })
    }
}

export const get_process = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.params.idproject)
        const result = await segmentationModel.get_process(idproject)

        return res.status(200).json({
            type: 'success',
            message: 'get process in segmentation success',
            total: result.total,
            process: result.inProcess
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get process in segmentation ERROR!!' })
    }
}