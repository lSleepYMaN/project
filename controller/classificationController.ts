import { Request, Response } from "express"
import fs from 'fs'
import path from "path";
import * as classificationModel from '../models/classificationModel'

export const createClassificationClass = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const class_label = req.body.class_label

        const getClass = await classificationModel.getClass(idproject, class_label)
        if (getClass.length != 0) {
            return res.status(500).json({ error: 'This label is already in use.' })
        }

        const createClass = await classificationModel.createClass(idproject, class_label)

        const indexFolder = path.join(__dirname, '../project_path' , `${idproject}`, 'classification', `${createClass.class_index}`)
        fs.mkdirSync(indexFolder, { recursive: true});

        return res.status(200).json({
            type: 'success',
            message: 'Create class success',
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create classification class ERROR!!' })
    }
}

export const uploadImage = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[]
        const idproject = parseInt(req.body.idproject)
        const index = req.body.index
        const dirUpload = path.join(__dirname, '../project_path' , `${idproject}`, 'classification', `${index}`)

        let fileCount = fs.readdirSync(dirUpload).length + 1
        let fileNames: string[] = []
       for (let i = 0; i < files.length; i++){
            const image = files[i]
            const fileName = `${fileCount.toString().padStart(8, '0')}${path.extname(image.originalname)}`
            fileCount += 1
            let filePath = path.join(dirUpload,fileName)
            fs.writeFileSync(filePath, image.buffer)
        }

        return res.status(200).json({
            type: 'success',
            message: 'upload image success',
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'upload image classification ERROR!!' })
    }
}

export const getAllClass = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.params.idproject)
        const getAllClass = await classificationModel.getAllClass(idproject)

        if (getAllClass.length == 0) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'no class', 
                getAllClass
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get class success',
            getAllClass
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get classification class ERROR!!' })
    }
}

export const getIMG = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const index = parseInt(req.body.index)
        const dirUpload = path.join(__dirname, '../project_path' , `${idproject}`, 'classification', `${index}`)
        let imgAll = fs.readdirSync(dirUpload)

        if (imgAll.length == 0) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'no image in folder', 
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get image success',
            imgAll
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get classification class ERROR!!' })
    }
}