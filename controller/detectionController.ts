import { Request, Response } from "express"
import * as detectionModel from '../models/detectionModel'
import * as segmentationModel from '../models/segmentationModel'
import * as classificationModel from '../models/classificationModel'
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
        const create2 = await segmentationModel.createClass(class_label, idproject)

        if(!create) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'Create label failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'Create label success',
            create,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create detection class ERROR!!' })
    }
}

export const getAllClass = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.params.idproject)
        const label = await detectionModel.getAllLabel(idproject)
        const strClass = []

        for(let i = 0; i < label.length; i++){
            strClass.push(label[i].class_label)
        }

        if(!label) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'Get all label failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'Get all label success',
            label,
            strClass,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get all detection class ERROR!!' })
    }
}

export const getClass = async (req: Request, res: Response) => {
    try {
        const class_id = parseInt(req.params.class_id)
        const label = await detectionModel.getLabelByID(class_id)
        if(!label) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'Get label failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'Get label success',
            label,
        })
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get detection class ERROR!!!' })
    }
}

export const updateClass = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const class_id = parseInt(req.body.class_id)
        const label_name = req.body.class_label
        const getLabel_name = await detectionModel.getLabelByID(class_id)
        const check_label = await detectionModel.getlabelName(idproject, label_name)
        if (check_label.length != 0) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'label has been used.', 
            })
        }
        const uplabel = await detectionModel.updateClassName(class_id, label_name)
        const getSegClass = await segmentationModel.getlabelName(idproject, getLabel_name[0].class_label)
        const uplabel2 = await segmentationModel.updateClassName(getSegClass[0].class_id, label_name)

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
        const getLabel_name = await detectionModel.getLabelByID(class_id)
        const check_label = await detectionModel.getLabelByID(class_id)
        if (check_label.length == 0) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'label not found', 
            })
        }
        const getSegClass = await segmentationModel.getlabelName(idproject, getLabel_name[0].class_label)
        const delclass = detectionModel.delLabel(class_id)
        const delclass2 = segmentationModel.delLabel(getSegClass[0].class_id)

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

export const getAllDetection = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.params.idproject)
        const detection = await detectionModel.getAllDetection(idproject)

        if(!detection) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'get all label failed', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get all label success',
            detection,
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get all detection ERROR!!' })
    }
}

export const CRUDBounding_box = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)
        const idproject = parseInt(req.body.idproject)
        const iddetection = parseInt(req.body.iddetection)
        const bounding_box = req.body.bounding_box
        const check_bbox = await detectionModel.getBounding_box(iddetection)
        
        for(let i = 0; i < bounding_box.length; i++){
            for (let j = 0; j < check_bbox.length; j++){
                if (bounding_box[i].id == check_bbox[j].idbounding_box) {

                    if (bounding_box[i].x1 != check_bbox[j].x1 || 
                        bounding_box[i].y1 != check_bbox[j].y1 || 
                        bounding_box[i].x2 != check_bbox[j].x2 || 
                        bounding_box[i].y2 != check_bbox[j].y2 ||
                        bounding_box[i].class_label != check_bbox[j].label[0].class_label) {
    
                        const updateBounding_box = await detectionModel.updateBounding_box(check_bbox[j].idbounding_box,bounding_box[i].x1,bounding_box[i].x2
                                                                                                ,bounding_box[i].y1,bounding_box[i].y2,bounding_box[i].class_label
                                                                                                ,user.id,iddetection,idproject)
                        check_bbox.slice(j, 1)
                        bounding_box.slice(i, 1)
                    } else {
                        check_bbox.slice(j, 1)
                        bounding_box.slice(i, 1)
                    }
    
                }
            }
        }
        for(let i = 0; i < bounding_box.length; i++){
            const saveBounding_box = await detectionModel.createBounding_box(bounding_box[i].x1,bounding_box[i].x2
                                                                            ,bounding_box[i].y1,bounding_box[i].y2
                                                                            ,iddetection,bounding_box[i].class_label
                                                                            ,user.id,idproject)
        }
        for(let i = 0; i < check_bbox.length; i++) {
            await detectionModel.delBounding_box(check_bbox[i].idbounding_box)
        }
        return res.status(200).json({
            type: 'success',
            message: 'CRUD bounding box success',

        })
        

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create bounding box ERROR!!!' })
    }
} 

export const getBounding_box = async (req: Request, res: Response) => {
    try {
        const iddetection = parseInt(req.params.iddetection)
        const data = await detectionModel.getBounding_box(iddetection)
        const detection = await detectionModel.getDetection(iddetection)
        let annotation = []

        if (data.length == 0) {
            return res.status(200).json({
                type: 'failed',
                message: 'There is no bounding box in this image',

            })
        }
        for (let i = 0; i < data.length; i++) {
            annotation.push(
                {
                    "id": `${data[i].idbounding_box}`,
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
                            "type": "FragmentSelector",
                            "conformsTo": "http://www.w3.org/TR/media-frags/",
                            "value": `xywh=pixel:${data[i].x1},${data[i].y1},${data[i].width},${data[i].height}`
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
        return res.status(500).json({ error: 'get bounding box ERROR!!' })
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
                    message: 'bounding box not found',

                })
            }
            const del = await detectionModel.delBounding_box(idbounding_box[i]) 
            console.log(del)
            if (!del) {
                return res.status(200).json({
                    type: 'failed',
                    idbounding_box: idbounding_box[i],
                    message: 'delete bounding box failed',

                })
            }
        }

        return res.status(200).json({
            type: 'success',
            message: 'delete bounding box success',

        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'delete bounding box ERROR!!' })
    }
}

export const detection_to_classification = async (req: Request, res:Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const checkClassification = await classificationModel.getAllClass(idproject)
        if (checkClassification.length != 0) {
            return res.status(200).json({
                type: 'failed',
                message: 'This project have classification data',
            })
        }
        const allClass = await detectionModel.getAllLabel(idproject)
        let total = 0
        
        for(let i = 0; i < allClass.length; i++){
            const create = await detectionModel.detection_to_classification(idproject, allClass[i])
            console.log(`create ${create} image`)
            total += create
        }
        
        console.log(`create total ${total} image`)

        return res.status(200).json({
            type: 'success',
            message: 'Convert detection to classification success',

        })

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Convert detection to classification ERROR!!' })
    }
}

export const get_process = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.params.idproject)
        const result = await detectionModel.get_process(idproject)

        return res.status(200).json({
            type: 'success',
            message: 'get process in detection success',
            total: result.total,
            process: result.inProcess
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get process in detection ERROR!!' })
    }
}