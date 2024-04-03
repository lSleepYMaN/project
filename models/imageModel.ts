import { PrismaClient } from "@prisma/client";
import fs from 'fs'
import path from "path";

const prisma = new PrismaClient()

export const saveImage = async (dir: string, type: string, images: Express.Multer.File[] ): Promise<boolean> => {
    try {
        let filePath = path.join(dir, type)
        let fileCount = fs.readdirSync(dir+type).length + 1
       for (let i = 0; i < images.length; i++){
        const image = images[i]
        const fileName = `${fileCount.toString().padStart(8, '0')}${path.extname(image.originalname)}`
        fileCount += 1
        filePath = path.join(dir, type, fileName)
        fs.writeFileSync(filePath, image.buffer)
        }

        return true

    } catch (error) {
        console.error('Error saving images:', error);
        return false;
    }
    
}

export const createFolder = async (name: string) => {
    const dirname = name as string
    const uploadDir = path.join(__dirname, '../project_path' , dirname)
    fs.mkdirSync(uploadDir);
    
    return uploadDir as string

}

export const createDetectionFolder = async (name: string) => {
    const project_name = name as string
    const pathDir = path.join(__dirname, '../project_path' , project_name, 'detection')
    fs.mkdirSync(pathDir);
    
    return pathDir as string

}