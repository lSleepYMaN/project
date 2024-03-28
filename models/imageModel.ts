import { PrismaClient } from "@prisma/client";
import fs from 'fs'
import path from "path";

const prisma = new PrismaClient()

export const saveImage = async (id: any, name: string, image: Express.Multer.File ) => {
    const dirname = name as string
    const uploadDir = path.join(__dirname, dirname)
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    const fileName = `${name}_${Date.now()}`
    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, image.buffer)

    return await prisma.project.update({
        where:{ idproject: id },
        data: { root_path: filePath}
    })
}