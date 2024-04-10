import { PrismaClient } from "@prisma/client";
import { dir } from "console";
import fs from 'fs'
import path from "path";
import sharp from 'sharp'
const prisma = new PrismaClient()

export const createClass = async (label_name: string, idproject: any) => {
    try {
        return await prisma.detection_class.create({
            data: {
                class_label: label_name,
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                idproject: idproject,
            }
        })
        
    } catch (error) {
        console.log("Create class detection ERROR!!")
        throw error
    }
}

export const getlabelName = async (idproject: any, label_name: string) => {
    try {
        return await prisma.detection_class.findMany({
            where: {
                AND: [{idproject: idproject}, {class_label: label_name}]
            }
        })
        
    } catch (error) {
        console.log("get label name ERROR!!")
        throw error
    }
}

export const getAllLabel = async (idproject: any) => {
    try {
        return await prisma.detection_class.findMany({
            where: {
                idproject: idproject
            },
            select: {
                class_id: true,
                class_label: true,
            }
        })
        
    } catch (error) {
        console.log("get all label name ERROR!!")
        throw error
    }
}

export const createDetection = async (dir: string, imageName: string, idproject: any) => {
    try {
        let imagePath = path.join(__dirname, '../project_path', dir, 'images', imageName)
        let imagePathSave = path.join(dir, 'images', imageName)
        const metadata = await sharp(imagePath).metadata()
        const width = metadata.width
        const height = metadata.height

        return await prisma.detection.create({
            data: {
                image_path: imagePathSave,
                height_image: height,
                width_image: width,
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                idproject: idproject,
            }
        })
        
    } catch (error) {
        console.log("create detection ERROR!!")
        throw error
    }
}