import { PrismaClient } from "@prisma/client";
import { dir } from "console";
import fs from 'fs'
import path from "path";
import sharp from 'sharp'
const prisma = new PrismaClient()

export const createClass = async (label_name: string, idproject: any) => {
    try {
        return await prisma.segmentation_class.create({
            data: {
                class_label: label_name,
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                idproject: idproject,
            }
        })
        
    } catch (error) {
        console.log("Create class segmentation ERROR!!")
        throw error
    }
}

export const getlabelName = async (idproject: any, label_name: string) => {
    try {
        return await prisma.segmentation_class.findMany({
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
        return await prisma.segmentation_class.findMany({
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

export const getAllSegmentation = async (idproject: any) => {
    try {
        return await prisma.segmentation.findMany({
            where: {idproject: idproject},
            select: {
                idsegmentation: true,
                image_path: true,
                height_image: true,
                width_image: true,
            }
        })
        
    } catch (error) {
        console.log("get segmentayion ERROR!!")
        throw error
    }
}

export const getPolygon = async (idsegmentation: any) => {
    try {
        return await prisma.polygon.findMany({
            where: {
                idsegmentation: idsegmentation
            },
            select: {
                idpolygon: true,
                xy_polygon: true,
                segmentation_class_id: true,
                user_id: true,
            }
        })
        
    } catch (error) {
        console.log("get polygon ERROR!!")
        throw error
    }
}

export const getPolygon_by_id = async (idpolygon: any) => {
    try {
        return await prisma.polygon.findUnique({
            where: {idpolygon: idpolygon}
        })
        
    } catch (error) {
        console.log("get polygon by id ERROR!!")
        throw error
    }
}

export const createSegmentation = async ( imageName: any[], idproject: any) => {
    try {
        for (let i = 0; i < imageName.length; i++) {
            let imagePath = path.join(__dirname, '../project_path', idproject.toString(), 'images', imageName[i])
            const metadata = await sharp(imagePath).metadata()
            const width = metadata.width
            const height = metadata.height

            await prisma.segmentation.create({
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
        console.log("create segmentation ERROR!!")
        throw error
    }
}

export const createPolygon = async (polygon: string, idsegmentation: any, segmentation_class_id: any, user_id: any) => {
    try {
        return await prisma.polygon.create({
            data: {
                xy_polygon: polygon, 
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                idsegmentation: idsegmentation,
                segmentation_class_id: segmentation_class_id,
                user_id: user_id
            }
        })
        
    } catch (error) {
        console.log("create polygon ERROR!!")
        throw error
    }

}

export const updatePolygon = async (idpolygon: any, xy_polygon: string, segmentation_class_id: any, user_id: any) => {
    try {
        return await prisma.polygon.update({
            where: {
                idpolygon: idpolygon
            },
            data: {
                xy_polygon: xy_polygon,
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                segmentation_class_id: segmentation_class_id,
                user_id: user_id
            }
        })
        
    } catch (error) {
        console.log("update polygon ERROR!!")
        throw error
    }
}

export const delPolygon = async (idpolygon: any) => {
    try {
        return await prisma.polygon.delete({
            where: {
                idpolygon: idpolygon
            }
        })
        
    } catch (error) {
        console.log("delete polygon ERROR!!")
        throw error
    }
}

export const delPolygon_by_segmentation = async (idsegmentation: any) => {
    try {
        return await prisma.polygon.deleteMany({
            where: {idsegmentation: idsegmentation}
        })
        
    } catch (error) {
        console.log("delete polygon ERROR!!")
        throw error
    }
}