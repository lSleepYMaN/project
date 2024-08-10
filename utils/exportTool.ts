import * as detectionModel from '../models/detectionModel'
import * as projectModel from '../models/projectModel'
import * as segmentationModel from '../models/segmentationModel'
import * as classificationModel from '../models/classificationModel'
import fs from 'fs'
import path from "path";
import sharp from 'sharp';
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
train: train
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

export const segmentation_YOLO = async (idproject: any) => {
    try {
        const label = await segmentationModel.getAllLabel(idproject)
        const segmentation = await segmentationModel.getAllSegmentation(idproject)
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

        for (let i = 0; i < segmentation.length; i++) {
            const polygon = await segmentationModel.export_polygon_YOLO(segmentation[i].idsegmentation, allClass)
            const imgName = segmentation[i].image_path?.split('.')[0];
            const annotations = polygon.map(annotation => {
                const { segmentation_class_id, xy_polygon } = annotation;
                return `${segmentation_class_id} ${xy_polygon}`;
            });
            const yoloFilePath = path.join(labelDir, `${imgName}.txt`);
            fs.writeFileSync(yoloFilePath, annotations.join('\n'));
        }

        for (let i = 0; i < segmentation.length; i++) {
            const imagePath = path.join(__dirname, '..', 'project_path', `${idproject}`, 'images', `${segmentation[i].image_path}`);
            const destPath = path.join(imageDir, `${segmentation[i].image_path}`);
            fs.copyFileSync(imagePath, destPath);
        }

        const yamlNames = allClass.map((name, index) => `  ${index}: ${name}`).join('\n');
        const yamlContent = `path: .
train: train
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

export const classification_export = async (idproject: any) => {
    try {
        const label = await classificationModel.getAllClass(idproject)
        const project = await projectModel.getprojectById(idproject);
        const dir = project?.project_name;
        const train = path.join(dir!, 'train');

        if (!fs.existsSync(dir!)) {
            fs.mkdirSync(dir!);
        }
        if (!fs.existsSync(train)) {
            fs.mkdirSync(train);
        }
        
        for(let i = 0; i < label.length; i++){
            const class_path = path.join(train, `${label[i].class_index}`)
            const imagePath = path.join(__dirname, '..', 'project_path', `${idproject}`, 'classification', `${label[i].class_index}`);
            if (!fs.existsSync(class_path)) {
                fs.mkdirSync(class_path);
            }
            const files = fs.readdirSync(imagePath);

            for (let j = 0; j < files.length; j++) {
                const sourceFile = path.join(imagePath, files[j]);
                const destinationFile = path.join(class_path, files[j]);
                fs.copyFileSync(sourceFile, destinationFile);
            }

        }

        let yamlNames = '';
        for (let i = 0; i < label.length; i++) {
            yamlNames += `  ${label[i].class_index}: ${label[i].class_label}\n`;
        }
const yamlContent = `path: .
train: train
names:
${yamlNames}`;

        fs.writeFileSync(path.join(dir!, 'data.yaml'), yamlContent);

        const zipFilePath = path.join(__dirname, '..', 'project_path', `${idproject}`, `${project?.project_name}.zip`);
        const zipFile = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        return new Promise<string>((resolve, reject) => {
            zipFile.on('close', () => {
                console.log(`Created zip file with ${archive.pointer()} total bytes`);
                rimraf.sync(dir!);
                console.log('Directory removed successfully');
                resolve(zipFilePath);
            });

            zipFile.on('error', (err) => {
                console.error('Error creating zip file:', err);
                reject(err);
            });

            archive.pipe(zipFile);
            archive.directory(dir, false);
            archive.finalize();
        });

    } catch (error) {
        console.error('error:', error);
        throw new Error('Failed to export YOLO data');
    }
}

export const detection_COCO = async (idproject: any) => {
    try {
        const label = await detectionModel.getAllLabel(idproject);
        const detection = await detectionModel.getAllDetection(idproject);
        const project = await projectModel.getprojectById(idproject);

        const allClass: string[] = [];
        const COCOdir = project?.project_name;
        const imagesDir = path.join(COCOdir!, 'train');
        const annotationsFile = path.join(imagesDir, 'annotations.json');

        if (!fs.existsSync(COCOdir!)) {
            fs.mkdirSync(COCOdir!);
        }
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir);
        }

        for (let i = 0; i < label.length; i++) {
            allClass.push(label[i].class_label);
        }

        const cocoAnnotations = {
            images: [] as any[],
            annotations: [] as any[],
            categories: allClass.map((name, index) => ({
                id: index + 1, name, supercategory: 'none'
            }))
        };

        let annotationId = 1;
        for (let i = 0; i < detection.length; i++) {
            const imgId = i + 1;
            const imgName = detection[i].image_path!;
            const imagePath = path.join(__dirname, '..', 'project_path', `${idproject}`, 'images', imgName);
            const destPath = path.join(imagesDir, imgName);

            fs.copyFileSync(imagePath, destPath);


            const imgMetadata = await sharp(destPath).metadata();
            cocoAnnotations.images.push({
                id: imgId, file_name: imgName, width: detection[i].width_image, height: detection[i].height_image
            });

            const bboxes = await detectionModel.export_bbox_COCO(detection[i].iddetection, allClass);
            for (const bbox of bboxes) {
                cocoAnnotations.annotations.push({
                    id: annotationId, image_id: imgId, category_id: bbox.detection_class_id + 1, bbox: [bbox.x, bbox.y, bbox.width, bbox.height], area: bbox.width * bbox.height, iscrowd: 0
                });
                annotationId++;
            }
        }

        fs.writeFileSync(annotationsFile, JSON.stringify(cocoAnnotations, null, 2));

        const zipFilePath = path.join(__dirname, '..', 'project_path', `${idproject}`, `${project?.project_name}.zip`);
        const zipFile = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        return new Promise<string>((resolve, reject) => {
            zipFile.on('close', () => {
                console.log(`Created zip file with ${archive.pointer()} total bytes`);
                rimraf.sync(COCOdir!);
                console.log('Directory removed successfully');
                resolve(zipFilePath);
            });

            zipFile.on('error', (err) => {
                console.error('Error creating zip file:', err);
                reject(err);
            });

            archive.pipe(zipFile);
            archive.directory(COCOdir, false);
            archive.finalize();
        });

    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to export COCO data');
    }
}

