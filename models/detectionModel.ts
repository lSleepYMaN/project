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

export const getDetection = async (imageName: string, idproject: any) => {
    try {
        return await prisma.detection.findMany({
            where: {
                AND: [{image_path: imageName}, {idproject: idproject}]
            },
            select: {
                iddetection: true,
                image_path: true,
                height_image: true,
                width_image: true,
            }
        })
        
    } catch (error) {
        console.log("get detection ERROR!!")
        throw error
    }
}

export const getAllDetection = async (idproject: any) => {
    try {
        return await prisma.detection.findMany({
            where: {idproject: idproject},
            select: {
                iddetection: true,
                image_path: true,
                height_image: true,
                width_image: true,
            }
        })
        
    } catch (error) {
        console.log("get detection ERROR!!")
        throw error
    }
}

export const getBounding_box = async (iddetection: any) => {
    try {
        return await prisma.bounding_box.findMany({
            where: {
                iddetection : iddetection
            },
            select: {
                idbounding_box: true,
                x1: true,
                x2: true,
                y1: true,
                y2: true,
                detection_class_id: true,
                user_id: true,
            }
        })
        
    } catch (error) {
        console.log("get bounding_box ERROR!!")
        throw error
    }
}

export const getBounding_box_by_id = async (idbounding_box: any) => {
    try {
        return await prisma.bounding_box.findUnique({
            where: {idbounding_box: idbounding_box}
        })
        
    } catch (error) {
        console.log("get bounding_box by id ERROR!!")
        throw error
    }
}

export const createDetection = async ( imageName: any[], idproject: any) => {
    try {
        for (let i = 0; i < imageName.length; i++) {
            let imagePath = path.join(__dirname, '../project_path', idproject.toString(), 'images', imageName[i])
            const metadata = await sharp(imagePath).metadata()
            const width = metadata.width
            const height = metadata.height

            await prisma.detection.create({
                data: {
                    image_path: imageName[i],
                    height_image: height,
                    width_image: width,
                    created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    idproject: idproject,
                }
            })   
        }
        
        
    } catch (error) {
        console.log("create detection ERROR!!")
        throw error
    }
}

export const createBounding_box = async (x1: any, x2: any, y1: any, y2: any, iddetection: any, detection_class_label: any, user_id: any, idproject: any) => {
    try {
        const check_label = await prisma.detection_class.findMany({
            where: {
                AND: [{idproject: idproject}, {class_label: detection_class_label}]
            }
        })
        if (check_label.length != 0) {
            return await prisma.bounding_box.create({
                data: {
                    x1: x1,
                    x2: x2,
                    y1: y1,
                    y2: y2,
                    created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    iddetection: iddetection,
                    detection_class_id: check_label[0]?.class_id,
                    user_id: user_id
                }
            })
        }
        const create_label =  await prisma.detection_class.create({
            data: {
                class_label: detection_class_label,
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                idproject: idproject,
            }
        })
        return await prisma.bounding_box.create({
            data: {
                x1: x1,
                x2: x2,
                y1: y1,
                y2: y2,
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                iddetection: iddetection,
                detection_class_id: create_label?.class_id,
                user_id: user_id
            }
        })
        
    } catch (error) {
        console.log("create bounding box ERROR!!")
        throw error
    }

}

export const updateBounding_box = async (idbounding_box: any, x1: any, x2: any, y1: any, y2: any, detection_class_id: any, user_id: any) => {
    try {
        return await prisma.bounding_box.update({
            where: {
                idbounding_box: idbounding_box
            },
            data: {
                x1: x1,
                x2: x2,
                y1: y1,
                y2: y2,
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                detection_class_id: detection_class_id,
                user_id: user_id
            }
        })
        
    } catch (error) {
        console.log("update bounding box ERROR!!")
        throw error
    }
}

export const delBounding_box = async (idbounding_box: any) => {
    try {
        return await prisma.bounding_box.delete({
            where: {
                idbounding_box: idbounding_box
            }
        })
        
    } catch (error) {
        console.log("delete bounding box ERROR!!")
        throw error
    }
}

export const delBounding_box_by_detection = async (iddetection: any) => {
    try {
        return await prisma.bounding_box.deleteMany({
            where: {iddetection: iddetection}
        })
        
    } catch (error) {
        console.log("delete bounding box ERROR!!")
        throw error
    }
}