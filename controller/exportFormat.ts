import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express"
import * as exportTool from '../utils/exportTool'
const archiver = require('archiver');
import fs from 'fs'


const prisma = new PrismaClient();

export const exportAllFormat = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.body.idproject);
        const type = req.body.type
        const format = req.body.format

        if (type == 'classification') {
            
        }

        if (type == 'detection') {
            if (format == 'YOLO') {
                const zipFilePath = await exportTool.detection_YOLO(idproject) as string
                
                res.download(zipFilePath, (err) => {
                    if (err) {
                        console.error('Error sending file:', err);
                        res.status(500).send('Error sending file');
                    } else {
                        console.log('File sent successfully');
                        fs.unlinkSync(zipFilePath);
                    }
                });
                
            }
            if (format == 'COCO') {
                
            }
        }

        if (type == 'segmentation') {
            if (format == 'YOLO') {
            }
            if (format == 'COCO') {
                
            }
        }
        
        // res.download(zipFilePath, (err) => {
        //     if (err) {
        //         console.error('Error sending file:', err);
        //         res.status(500).send('Error sending file');
        //     } else {
        //         console.log('File sent successfully');
        //         fs.unlinkSync(zipFilePath);
        //     }
        // });

    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'export detection YOLO ERROR!!!' });
    }
}
