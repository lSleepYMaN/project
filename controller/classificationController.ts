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
            const originalName = path.basename(image.originalname, path.extname(image.originalname));
            const fileName = `${fileCount.toString().padStart(8, '0')}_${originalName}${path.extname(image.originalname)}`;
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
        const strClass = await classificationModel.getAllClass(idproject)

        if (getAllClass.length == 0) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'no class', 
                strClass
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'get class success',
            strClass
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
                imgAll 
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

export const updateClass = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const index = parseInt(req.body.index)
        const class_label = req.body.class_label

        const update = await classificationModel.updateClass(idproject, index, class_label)

        if (!update) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'update class failed',
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'update class success',
            update
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'update class ERROR!!' })
    }
}

export const delClass = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject)
        const index = parseInt(req.body.index)

        const delClass = await classificationModel.delClass(idproject, index)
        
        if (!delClass) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'delete class failed',
            })
        }

        return res.status(200).json({
            type: 'success',
            message: 'delete class success',
        })

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'update class ERROR!!' })
    }
}

export const get_process = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.params.idproject)
        const getAllClass = await classificationModel.getAllClass(idproject)

        if (!getAllClass) {
            return res.status(500).json({ 
                type: 'failed',
                message: 'This project no classification',
            })
        }

        let process = 0
        
        for(let i = 0; i < getAllClass.length; i++){
            const dir = path.join(__dirname, '../project_path' , `${idproject}`, 'classification', `${getAllClass[i].class_index}`)
            let fileCount = fs.readdirSync(dir).length
            if (fileCount > 0) {
                process ++
            } else {
                console.log('This class has no image.')
            }
        }

        return res.status(200).json({
            type: 'success',
            message: 'get process in classification success',
            total: getAllClass.length,
            process
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'get process in classification ERROR!!' })
    }
}