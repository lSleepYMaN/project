import { Request, Response } from "express"
import * as projectModel from '../models/projectModel'
import * as userModel from '../models/userModel'
import * as imageModel from '../models/imageModel'
import * as detectionModel from '../models/detectionModel'
import * as fileService from '../utils/fileService'
import * as mapClassId from '../utils/mapClassId'
const jwt = require('jsonwebtoken')
import { parse } from 'yaml';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp'

export const YOLO_detection = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)
        const file = req.file
        const projectName = req.body.projectName
        const idproject = parseInt(req.body.idproject)
        const projectPath = path.join(process.cwd(), 'uploads');

        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath, { recursive: true });
        }
        const projectPath2 = path.join(process.cwd(), 'uploads', projectName);

        await fileService.extractZip(file?.path!, projectPath,)

        fs.unlinkSync(file?.path!)

        const imagesDir = path.join(projectPath2, 'images', 'train');
        const labelsDir = path.join(projectPath2, 'labels', 'train');

        const labels: { index: number, label: string, projectId: number }[] = [];
        const detections: any[] = [];

        let img = path.join(__dirname, '../project_path', idproject.toString(), 'images')

        const imageFiles = fs.readdirSync(imagesDir);
        const storagePath = path.join(__dirname, '../project_path', idproject.toString(), 'images');
        let thumbsPath = path.join(__dirname, '../project_path', idproject.toString(), 'thumbs')
        // if (!fs.existsSync(storagePath)) {
        //     fs.mkdirSync(storagePath, { recursive: true });
        // }

        for (const imageFile of imageFiles) {
            const newFilePath = path.join(storagePath, imageFile);
            console.log("newFilePath : ", newFilePath)
            let thumbsPath = path.join(__dirname, '../project_path', idproject.toString(), 'thumbs', imageFile)
            fs.copyFileSync(path.join(imagesDir, imageFile), newFilePath);
            sharp(newFilePath).resize(200,200).toFile(thumbsPath)

            await detectionModel.createDetection(imageFile, idproject)

        }

        const yamlPath = path.join(projectPath2, 'data.yaml');
        if (fs.existsSync(yamlPath)) {
            const yamlContent = fs.readFileSync(yamlPath, 'utf-8');
            const parsedYaml = parse(yamlContent);

            if (parsedYaml.names && typeof parsedYaml.names === 'object') {
                Object.keys(parsedYaml.names).forEach((key: string) => {
                    const index = parseInt(key);
                    const label = parsedYaml.names[key];
                    labels.push({ index, label, projectId: idproject });
                });
            } else {
                return res.status(400).json({ error: 'Invalid YAML structure: names field is missing or not an object' });
            }
        } else {
            return res.status(400).json({ error: 'data.yaml file not found' });
        }
        console.log(labels)
        for (const label of labels) {
            await detectionModel.createClass(label.label, idproject);
        }
        const labelFiles = fs.readdirSync(labelsDir);

        for (const labelFile of labelFiles) {
            const filePath = path.join(labelsDir, labelFile);
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    const [classId, x_center, y_center, width, height] = line.split(' ');
                    const baseName = path.basename(labelFile, '.txt');
                let imageFileName = `${baseName}.jpg`;
                console.log("Name : ",imageFileName)

                if (fs.existsSync(path.join(imagesDir, `${baseName}.png`))) {
                    imageFileName = `${baseName}.png`;
                }
                    detections.push({
                        classId: await mapClassId.map_detection_import(parseInt(classId),labels,idproject),
                        x1: parseFloat(x_center) - (parseFloat(width)/2),
                        y1: parseFloat(y_center) - (parseFloat(height)/2),
                        x2: parseFloat(x_center) + (parseFloat(width)/2),
                        y2: parseFloat(y_center) + (parseFloat(height)/2),
                        user_id: user.id,
                        idproject: idproject
                    });
                }
            }
        }

        const save_bbox = await detectionModel.create_import_Bounding_box(detections, user.id, idproject)
        
        if (save_bbox == 0) {
            return res.status(200).json({
                type: 'failed',
                message: 'import bbox ไม่สำเร็จ',

            })
        }

        if (save_bbox == 1) {
            return res.status(200).json({
                type: 'success',
                message: 'import bbox สำเร็จ',
            })
        }
        
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'upload YOLO detection ERROR!!' })
    }
}