import { Request, Response } from "express"
import * as projectModel from '../models/projectModel'
import * as userModel from '../models/userModel'
import * as imageModel from '../models/imageModel'
import * as detectionModel from '../models/detectionModel'
import * as segmentationModel from '../models/segmentationModel'
const AdmZip = require('adm-zip')
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
        const idproject = parseInt(req.body.idproject)
        const projectPath = path.join(process.cwd(), 'uploads', idproject.toString());

        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath, { recursive: true });
        }
        
        const zip = new AdmZip(file?.path!);
        zip.extractAllTo(projectPath, true);

        fs.unlinkSync(file?.path!)

        const imagesDir = path.join(projectPath, 'train', 'images');
        const labelsDir = path.join(projectPath, 'train', 'labels');

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
            let thumbsPath = path.join(__dirname, '../project_path', idproject.toString(), 'thumbs', imageFile)
            fs.copyFileSync(path.join(imagesDir, imageFile), newFilePath);
            sharp(newFilePath).resize(200,200).toFile(thumbsPath)

            await detectionModel.createDetection(imageFile, idproject)

        }

        const yamlPath = path.join(projectPath, 'data.yaml');
        if (fs.existsSync(yamlPath)) {
            const yamlContent = fs.readFileSync(yamlPath, 'utf-8');
            const parsedYaml = parse(yamlContent);

            if (parsedYaml.names && typeof parsedYaml.names === 'object') {
                Object.keys(parsedYaml.names).forEach((key: any) => {
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

                if (fs.existsSync(path.join(imagesDir, `${baseName}.png`))) {
                    imageFileName = `${baseName}.png`;
                }
                const imgPath = path.join(imagesDir, imageFileName)
                const metadata = await sharp(imgPath).metadata();
                const image_width = metadata.width;
                const image_height = metadata.height;
                    detections.push({
                        classId: await mapClassId.map_detection_import(parseInt(classId),labels,idproject),
                        x1: ((parseFloat(x_center)*image_width!) - ((parseFloat(width)*image_width!)/2))/image_width!,
                        y1: ((parseFloat(y_center)*image_height!) - ((parseFloat(height)*image_height!)/2))/image_height!,
                        x2: ((parseFloat(x_center)*image_width!) + ((parseFloat(width)*image_width!)/2))/image_width!,
                        y2: ((parseFloat(y_center)*image_height!) + ((parseFloat(height)*image_height!)/2))/image_height!,
                        user_id: user.id,
                        image_path: imageFileName,
                        idproject: idproject
                    });
                }
            }
        }

        const trainDir = path.join(projectPath, 'train');

        if (fs.existsSync(projectPath)) {
            fs.readdirSync(imagesDir).forEach((file) => {
                const filePath = path.join(imagesDir, file);
                fs.unlinkSync(filePath);
            })
            fs.readdirSync(labelsDir).forEach((file) => {
                const filePath = path.join(labelsDir, file);
                fs.unlinkSync(filePath);
            })
            fs.rmdirSync(imagesDir);
            fs.rmdirSync(labelsDir);
            fs.rmdirSync(trainDir);
            fs.readdirSync(projectPath).forEach((file) => {
                const filePath = path.join(projectPath, file);
                fs.unlinkSync(filePath);
            })
            fs.rmdirSync(projectPath);
        }

        const save_bbox = await detectionModel.create_import_Bounding_box(detections, user.id, idproject)
        
        if (save_bbox == 0) {
            return res.status(200).json({
                type: 'failed',
                message: 'import bbox failed',

            })
        }

        if (save_bbox == 1) {
            return res.status(200).json({
                type: 'success',
                message: 'import bbox success',
            })
        }
        
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'upload YOLO detection ERROR!!' })
    }
}

export const YOLO_segmentation = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token
        const user = jwt.verify(token, process.env.SECRET as string)
        const file = req.file
        const idproject = parseInt(req.body.idproject)
        const projectPath = path.join(process.cwd(), 'uploads', idproject.toString());

        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath, { recursive: true });
        }
        
        const zip = new AdmZip(file?.path!);
        zip.extractAllTo(projectPath, true);

        fs.unlinkSync(file?.path!)

        const imagesDir = path.join(projectPath, 'train', 'images');
        const labelsDir = path.join(projectPath, 'train', 'labels');

        const labels: { index: number, label: string, projectId: number }[] = [];
        const segmentations: any[] = [];

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

            await segmentationModel.createSegmentation(imageFile, idproject)

        }

        const yamlPath = path.join(projectPath, 'data.yaml');
        if (fs.existsSync(yamlPath)) {
            const yamlContent = fs.readFileSync(yamlPath, 'utf-8');
            const parsedYaml = parse(yamlContent);

            if (parsedYaml.names && typeof parsedYaml.names === 'object') {
                Object.keys(parsedYaml.names).forEach((key: any) => {
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
        for (const label of labels) {
            await segmentationModel.createClass(label.label, idproject);
        }
        const labelFiles = fs.readdirSync(labelsDir);

        for (const labelFile of labelFiles) {
            const filePath = path.join(labelsDir, labelFile);
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    const values = line.split(' ')
                    const classId = values[0]
                    const x = values.shift()
                    console.log('ClassID : ', classId)
                    const polygons: string[] = []
                    for(let i = 0; i < values.length; i+=2){
                        const polygon = `${values[i]},${values[i+1]}`
                        polygons.push(polygon)
                    }
                    const xy_polygon = polygons.join(' ')
                    const baseName = path.basename(labelFile, '.txt');
                
                    let imageFileName = `${baseName}.jpg`;

                    if (fs.existsSync(path.join(imagesDir, `${baseName}.png`))) {
                    imageFileName = `${baseName}.png`;
                    }
                    const imgPath = path.join(imagesDir, imageFileName)
                    const metadata = await sharp(imgPath).metadata();
                    console.log(labels)
                        segmentations.push({
                            classId: await mapClassId.map_segmentation_import(classId,labels,idproject),
                            xy_polygon: xy_polygon,
                            user_id: user.id,
                            image_path: imageFileName,
                            idproject: idproject
                        });
                }
            }
        }

        const trainDir = path.join(projectPath, 'train');

        if (fs.existsSync(projectPath)) {
            fs.readdirSync(imagesDir).forEach((file) => {
                const filePath = path.join(imagesDir, file);
                fs.unlinkSync(filePath);
            })
            fs.readdirSync(labelsDir).forEach((file) => {
                const filePath = path.join(labelsDir, file);
                fs.unlinkSync(filePath);
            })
            fs.rmdirSync(imagesDir);
            fs.rmdirSync(labelsDir);
            fs.rmdirSync(trainDir);
            fs.readdirSync(projectPath).forEach((file) => {
                const filePath = path.join(projectPath, file);
                fs.unlinkSync(filePath);
            })
            fs.rmdirSync(projectPath);
        }
        const save_polygon = await segmentationModel.create_import_Polygon(segmentations, user.id, idproject)
        
        if (save_polygon == 0) {
            return res.status(200).json({
                type: 'failed',
                message: 'import polygon failed',

            })
        }

        if (save_polygon == 1) {
            return res.status(200).json({
                type: 'success',
                message: 'import polygon success',
            })
        }
        
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'upload YOLO segmentation ERROR!!' })
    }
}