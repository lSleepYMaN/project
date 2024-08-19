import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express"
import * as exportTool from '../utils/exportTool'
const archiver = require('archiver');
import fs from 'fs'
import path from "path";


const prisma = new PrismaClient();


export const exportAllFormat = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject);
        const type = req.body.type
        const format = req.body.format

        if (type == 'classification') {
            const zipFilePath = await exportTool.classification_export(idproject) as string
            const fileName = path.basename(zipFilePath)

            return res.status(200).json({
                type: 'success',
                message: 'upload image success',
                fileName
            })
        }

        if (type == 'detection') {
            if (format == 'YOLO') {
                const zipFilePath = await exportTool.detection_YOLO(idproject) as string
                const fileName = path.basename(zipFilePath)

                return res.status(200).json({
                    type: 'success',
                    message: 'upload image success',
                    fileName
                })
                
            }
            if (format == 'COCO') {
                const zipFilePath = await exportTool.detection_COCO(idproject) as string
                const fileName = path.basename(zipFilePath)

                return res.status(200).json({
                    type: 'success',
                    message: 'upload image success',
                    fileName
                })
            }
        }

        if (type == 'segmentation') {
            if (format == 'YOLO') {
                const zipFilePath = await exportTool.segmentation_YOLO(idproject) as string
                const fileName = path.basename(zipFilePath)

                return res.status(200).json({
                    type: 'success',
                    message: 'upload image success',
                    fileName
                })

            }
            if (format == 'COCO') {
                const zipFilePath = await exportTool.segmentation_COCO(idproject) as string
                const fileName = path.basename(zipFilePath)
                
                return res.status(200).json({
                    type: 'success',
                    message: 'upload image success',
                    fileName
                })
            }
        }

    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'export detection YOLO ERROR!!!' });
    }
}

export const downloadFile = (req: Request, res: Response) => {
    const fileName = req.body.filePath as string;
    const idproject = req.body.idproject as string
    if (!fileName) {
        return res.status(400).send('File path is required');
    }

    const fullFilePath = path.join(__dirname, '..', 'project_path', idproject, fileName);
    if (fs.existsSync(fullFilePath)) {
        res.download(fullFilePath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Error sending file');
            } else {
                console.log('File sent successfully');
                fs.unlinkSync(fullFilePath);
            }
        });
    } else {
        res.status(404).send('File not found');
    }
};
