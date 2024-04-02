import { PrismaClient } from "@prisma/client";
import fs from 'fs'
import path from "path";

const prisma = new PrismaClient()

export const saveImage = async (dir: string, images: Express.Multer.File[] ): Promise<boolean> => {
    try {
       for (let i = 0; i < images.length; i++){
        const image = images[i]
        const fileCount = fs.readdirSync(dir).length + 1
        const fileName = `${fileCount.toString().padStart(8, '0')}${path.extname(image.originalname)}`
        const filePath = path.join(dir, fileName)
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
    const uploadDir = path.join(__dirname, '../images' , dirname)
    fs.mkdirSync(uploadDir);
    
    return uploadDir as string

}