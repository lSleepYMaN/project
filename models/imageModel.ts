import { PrismaClient } from "@prisma/client";
import fs from 'fs'
import path from "path";

const prisma = new PrismaClient()

export const saveImage = async (dir: string, type: string, images: Express.Multer.File[] ): Promise<boolean> => {
    try {
        let filePath = path.join(dir, type, 'images')
        let fileCount = fs.readdirSync(filePath).length + 1
       for (let i = 0; i < images.length; i++){
        const image = images[i]
        const fileName = `${fileCount.toString().padStart(8, '0')}${path.extname(image.originalname)}`
        fileCount += 1
        filePath = path.join(dir, type, 'images', fileName)
        fs.writeFileSync(filePath, image.buffer)
        }

        return true

    } catch (error) {
        console.error('Error saving images:', error);
        return false;
    }
    
}
