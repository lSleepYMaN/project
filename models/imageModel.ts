import { PrismaClient } from "@prisma/client";
import fs from 'fs'
import path from "path";
import sharp from 'sharp'


const prisma = new PrismaClient()

export const saveImage = async (idproject: any, images: Express.Multer.File[]) => {
    try {
        let projectPath = path.join(__dirname, '../project_path', idproject.toString(), 'images')
        let fileCount = fs.readdirSync(projectPath).length + 1
        let fileNames: string[] = []
       for (let i = 0; i < images.length; i++){
            const image = images[i]
            const originalName = path.basename(image.originalname, path.extname(image.originalname));
            const fileName = `${fileCount.toString().padStart(8, '0')}_${originalName}${path.extname(image.originalname)}`;
            fileCount += 1
            let filePath = path.join(__dirname, '../project_path', idproject.toString(), 'images',fileName)
            let thumbsPath = path.join(__dirname, '../project_path', idproject.toString(), 'thumbs',fileName)
            fs.writeFileSync(filePath, image.buffer)
            sharp(image.buffer).resize(200,200).toFile(thumbsPath)

            const metadata = await sharp(image.buffer).metadata()
            const width = metadata.width
            const height = metadata.height

            await prisma.detection.create({
                data: {
                    image_path: fileName,
                    height_image: height,
                    width_image: width,
                    created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    idproject: idproject,
                }
            })
            
            await prisma.segmentation.create({
                data: {
                    image_path: fileName,
                    height_image: height,
                    width_image: width,
                    created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    idproject: idproject,
                }
            })     
        }

        return true

    } catch (error) {
        console.error('Error saving images:', error);
        return false;
    }
    
}

export const getImg = async (idproject: any) => {
    try {
        const detectionImg = await prisma.detection.findFirst({
            where:{
                idproject
            }
        })

        if (!detectionImg) {
            const segmentationImg = await prisma.segmentation.findFirst({
                where:{
                    idproject
                }
            })
            if (!segmentationImg) {
                const classificationImg = await prisma.classification.findFirst({
                    where:{
                        idproject
                    }
                })
                if (!classificationImg) {
                    return 0
                }
                return classificationImg?.image_path
            }
            return segmentationImg?.image_path
        }

        return detectionImg?.image_path
        
    } catch (error) {
        console.error('Error get image:', error);
        return false;
    }
}

export const delImg = async (idproject: any, imgName: any ) => {
    try {
        const projectPath = path.join(__dirname, '../project_path', idproject.toString());
        const projectPathIM = path.join(projectPath, 'images');
        const projectPathTH = path.join(projectPath, 'thumbs');

        const filePath = path.join(projectPathIM, imgName);
        await fs.unlinkSync(filePath);

        const filePathth = path.join(projectPathTH, imgName);
        await fs.unlinkSync(filePathth);

        console.log(`image ${imgName} deleted successfully.`);
        return true;
        
    } catch (error) {
        console.error('Error deleting image:', error);
        return true;
    }
}

export const delImgClassification = async (idproject: any, imgName: any, index: any) => {
    try {
        const filePath = path.join(__dirname, '../project_path', idproject.toString(), 'classification', index.toString(), imgName.toString()) ;
        await fs.unlinkSync(filePath);

        console.log(`image ${imgName} deleted successfully.`);
        return true;
        
    } catch (error) {
        console.error('Error deleting image:', error);
        return true;
    }
}

