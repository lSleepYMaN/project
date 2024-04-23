import { PrismaClient } from "@prisma/client";
import fs from 'fs'
import path from "path";
import sharp from 'sharp'


const prisma = new PrismaClient()

export const saveImage = async (idproject: any, images: Express.Multer.File[], type: string) => {
    try {
        let projectPath = path.join(__dirname, '../project_path', idproject.toString(), 'images')
        let fileCount = fs.readdirSync(projectPath).length + 1
        let fileNames: string[] = []
       for (let i = 0; i < images.length; i++){
            const image = images[i]
            const fileName = `${fileCount.toString().padStart(8, '0')}${path.extname(image.originalname)}`
            fileCount += 1
            let filePath = path.join(__dirname, '../project_path', idproject.toString(), 'images',fileName)
            let thumbsPath = path.join(__dirname, '../project_path', idproject.toString(), 'thumbs',fileName)
            fs.writeFileSync(filePath, image.buffer)
            sharp(image.buffer).resize(200,200).toFile(thumbsPath)

            if (type == 'detection') {
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
            }
            
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