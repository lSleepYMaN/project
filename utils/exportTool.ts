import * as detectionModel from '../models/detectionModel'
import * as projectModel from '../models/projectModel'
import fs from 'fs'
import path from "path";
const archiver = require('archiver');
import { rimraf } from "rimraf";

export const detection_YOLO = async (idproject: any) => {
    try {
        const label = await detectionModel.getAllLabel(idproject);
        const detection = await detectionModel.getAllDetection(idproject);
        const project = await projectModel.getprojectById(idproject);
        const allClass: string[] = [];
        const YOLOdir = project?.project_name;
        const train = path.join(YOLOdir!, 'train');
        const imageDir = path.join(train, 'images');
        const labelDir = path.join(train, 'labels');

        if (!fs.existsSync(YOLOdir!)) {
            fs.mkdirSync(YOLOdir!);
        }
        if (!fs.existsSync(train)) {
            fs.mkdirSync(train);
        }
        if (!fs.existsSync(imageDir)) {
            fs.mkdirSync(imageDir);
        }
        if (!fs.existsSync(labelDir)) {
            fs.mkdirSync(labelDir);
        }

        for (let i = 0; i < label.length; i++) {
            allClass.push(label[i].class_label);
        }

        for (let i = 0; i < detection.length; i++) {
            const bbox = await detectionModel.export_bbox_YOLO(detection[i].iddetection, allClass);
            const imgName = detection[i].image_path?.split('.')[0];
            const annotations = bbox.map(annotation => {
                const { detection_class_id, x_center, y_center, width, height } = annotation;
                return `${detection_class_id} ${x_center} ${y_center} ${width} ${height}`;
            });
            const yoloFilePath = path.join(labelDir, `${imgName}.txt`);
            fs.writeFileSync(yoloFilePath, annotations.join('\n'));
        }

        for (let i = 0; i < detection.length; i++) {
            const imagePath = path.join(__dirname, '..', 'project_path', `${idproject}`, 'images', `${detection[i].image_path}`);
            const destPath = path.join(imageDir, `${detection[i].image_path}`);
            fs.copyFileSync(imagePath, destPath);
        }

        const yamlNames = allClass.map((name, index) => `  ${index}: ${name}`).join('\n');
        const yamlContent = `path: .
train: train/images
names:
${yamlNames}`

        fs.writeFileSync(path.join(YOLOdir!, 'data.yaml'), yamlContent);

        const configYamlContent = `task: detect
mode: train
model: yolov8n.pt
patience: 50
project: ${project?.project_name}
name: 8n_640
hsv_h: 0
hsv_s: 0
hsv_v: 0
degrees: 0
translate: 0.1
scale: 0.1
shear: 0.0
perspective: 0.0
flipud: 0
fliplr: 0.5
mosaic: 0
mixup: 0`

        fs.writeFileSync(path.join(YOLOdir!, 'config.yaml'), configYamlContent);

        const zipFilePath = path.join(__dirname, '..', 'project_path', `${idproject}`, `${project?.project_name}.zip`);
        const zipFile = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        return new Promise<string>((resolve, reject) => {
            zipFile.on('close', () => {
                console.log(`Created zip file with ${archive.pointer()} total bytes`);
                rimraf.sync(YOLOdir!);
                console.log('Directory removed successfully');
                resolve(zipFilePath);
            });

            zipFile.on('error', (err) => {
                console.error('Error creating zip file:', err);
                reject(err);
            });

            archive.pipe(zipFile);
            archive.directory(YOLOdir, false);
            archive.finalize();
        });

    } catch (error) {
        console.error('error:', error);
        throw new Error('Failed to export YOLO data');
    }
}
