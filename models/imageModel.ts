import { PrismaClient } from "@prisma/client";
import fs from 'fs'
import path from "path";
import sharp from 'sharp'


const prisma = new PrismaClient()

export const saveImage = async (dir: string, images: Express.Multer.File[] ): Promise<boolean> => {
    try {
        let projectPath = path.join(__dirname, '../project_path', dir, 'images')
        let fileCount = fs.readdirSync(projectPath).length + 1
       for (let i = 0; i < images.length; i++){
            const image = images[i]
            const fileName = `${fileCount.toString().padStart(8, '0')}${path.extname(image.originalname)}`
            fileCount += 1
            let filePath = path.join(__dirname, '../project_path', dir, 'images',fileName)
            let thumbsPath = path.join(__dirname, '../project_path', dir, 'thumbs',fileName)
            fs.writeFileSync(filePath, image.buffer)
            sharp(image.buffer).resize(200,200).toFile(thumbsPath)
        }

        return true

    } catch (error) {
        console.error('Error saving images:', error);
        return false;
    }
    
}

export const pullallImage = async (dir: string) => {
    try {
        const filePath = path.join(__dirname, '../project_path', dir, 'images')
        const imageFile = fs.readdirSync(filePath)

        return imageFile
        
    } catch (error) {
        console.error('get image ERROR!!:', error);
        return false;
    }

}