import { Request, Response } from "express"
import * as projectModel from '../models/projectModel'
import * as userModel from '../models/userModel'
import * as imageModel from '../models/imageModel'
import * as detectionModel from '../models/detectionModel'
import * as fileService from '../utils/fileService'
const jwt = require('jsonwebtoken')
import { parse } from 'yaml';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp'

export const YOLO_detection = async (req: Request, res: Response) => {
    try {
        const file = req.file
        const projectName = req.body.projectName
        const idproject = parseInt(req.body.idproject)
        const projectPath = path.join(process.cwd(), 'uploads', projectName);

        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath, { recursive: true });
        }

        await fileService.extractZip(file?.path!, projectPath)

        fs.unlinkSync(file?.path!)

        const imagesDir = path.join(projectPath, 'images');
        const labelsDir = path.join(projectPath, 'labels');

        const labels: any[] = [];
        const detections: any[] = [];

        const yamlPath = path.join(projectPath, 'data.yaml');
        if (fs.existsSync(yamlPath)) {
            const yamlContent = fileService.readYamlFile(yamlPath);
            const parsedYaml = parse(yamlContent);

            if (parsedYaml.names) {
                parsedYaml.names.forEach((name: string, index: number) => {
                    labels.push({ index, label: name, projectId: idproject });
                });
            }
        }
        const labelFiles = fs.readdirSync(labelsDir);

        for (const labelFile of labelFiles) {
            const filePath = path.join(labelsDir, labelFile);
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    const [classId, x_center, y_center, width, height] = line.split(' ');
                    detections.push({
                        classId: parseInt(classId),
                        x_center: parseFloat(x_center),
                        y_center: parseFloat(y_center),
                        width: parseFloat(width),
                        height: parseFloat(height),
                        image_path: labelFile.replace('.txt', '.jpg'),
                        projectId: idproject
                    });
                }
            }
        }

        let img = path.join(__dirname, '../project_path', idproject.toString(), 'images')
        let fileCount = fs.readdirSync(img).length + 1

        const imageFiles = fs.readdirSync(imagesDir);
        const storagePath = path.join(process.cwd(), 'stored_images', projectName);
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath, { recursive: true });
        }

        for (const imageFile of imageFiles) {
            const newFileName = `${fileCount.toString().padStart(8, '0')}${path.extname(imageFile)}`;
            const newFilePath = path.join(storagePath, newFileName);
            fs.copyFileSync(path.join(imagesDir, imageFile), newFilePath);

            // Get metadata using sharp
            const metadata = await sharp(newFilePath).metadata();

            fileCount++;
        }
        
    } catch (error) {
        console.error('error:', error);
        return res.status(400).json({ error: 'upload YOLO detection ERROR!!' })
    }
}