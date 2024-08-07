import { PrismaClient } from "@prisma/client";
import { dir } from "console";
import fs from 'fs'
import path from "path";
import sharp from 'sharp'
import * as polygon_config from '../utils/polygon_config'
import * as mapClassId from '../utils/mapClassId'
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

export const getLabelByID = async (class_id: any) => {
    try {
        return await prisma.segmentation_class.findMany({
            where: {class_id},
            select: {
                class_id: true,
                class_label: true,
            }
        })
        
    } catch (error) {
        console.log("get label by id ERROR!!")
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

export const updateClassName = async (class_id: any, label_name: any) => {
    try {
        return await prisma.segmentation_class.update({
            where: {
                class_id
            },
            data: {
                class_label: label_name
            }
        })
        
    } catch (error) {
        console.log("update label ERROR!!")
        throw error
    }
}

export const delLabel = async (class_id: any) => {
    try {
        const check_polygon = await prisma.polygon.findMany({
            where: {
                segmentation_class_id: class_id
            }
        })
        if (check_polygon.length != 0) {
           await prisma.polygon.deleteMany({
            where: {
                segmentation_class_id: class_id
            }
        }) 
        }
        

        return await prisma.segmentation_class.delete({
            where: {
                class_id
            }
        })
        
    } catch (error) {
        console.log("delete label ERROR!!")
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

export const getSegmentationByImg = async (idproject: any, img: string) => {
    try {
        return await prisma.segmentation.findMany({
            where: {idproject: idproject, image_path: img},
            select: {
                idsegmentation: true,
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

export const getPolygon = async (idsegmentation: any) => {
    try {
        const whIMG = await prisma.segmentation.findUnique({
            where: {
                idsegmentation
            }
        })

        const polygon = await prisma.polygon.findMany({
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

        const modifiedPolygon = await Promise.all(polygon.map(async poly => ({
            idpolygon: poly.idpolygon,
            xy_polygon: await polygon_config.convert_to_normal(poly.xy_polygon!, whIMG?.width_image!, whIMG?.height_image!),
            segmentation_class_id: poly.segmentation_class_id,
            label: await getLabelByID(poly.segmentation_class_id),
            user_id: poly.user_id
        })))

        return modifiedPolygon
        
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

export const createSegmentation = async ( imageName: any, idproject: any) => {
    try {
            let imagePath = path.join(__dirname, '../project_path', idproject.toString(), 'images', imageName)
            const metadata = await sharp(imagePath).metadata()
            const width = metadata.width
            const height = metadata.height

            await prisma.segmentation.create({
                data: {
                    image_path: imageName,
                    height_image: height,
                    width_image: width,
                    created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    idproject: idproject,
                }
            })   

        
        
    } catch (error) {
        console.log("create segmentation ERROR!!")
        throw error
    }
}

export const createPolygon = async (polygon: string, idsegmentation: any, segmentation_class_label: any, user_id: any, idproject: any) => {
    try {

        const whIMG = await prisma.segmentation.findUnique({
            where: {idsegmentation}
        })
        const check_label = await prisma.segmentation_class.findMany({
            where: {
                AND: [{idproject: idproject}, {class_label: segmentation_class_label}]
            }
        })

        const point = await polygon_config.convert_to_normalize(polygon, whIMG?.width_image!, whIMG?.height_image!)
        
        if (check_label.length != 0) {
            return await prisma.polygon.create({
                data: {
                    xy_polygon: point, 
                    created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    idsegmentation: idsegmentation,
                    segmentation_class_id: check_label[0]?.class_id,
                    user_id: user_id
                }
            })
        }
        const create_label =  await prisma.segmentation_class.create({
            data: {
                class_label: segmentation_class_label,
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                idproject: idproject,
            }
        })
        return await prisma.polygon.create({
            data: {
                xy_polygon: point, 
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                idsegmentation: idsegmentation,
                segmentation_class_id: create_label?.class_id,
                user_id: user_id
            }
        })
        
        
    } catch (error) {
        console.log("ERROR!!!")
        throw error
    }

}

export const updatePolygon = async (idpolygon: any, xy_polygon: string, segmentation_class_label: any, user_id: any, idsegmentation: any, idproject: any) => {
    try {
        const whIMG = await prisma.segmentation.findUnique({
            where: {idsegmentation}
        })
        const check_label = await prisma.segmentation_class.findMany({
            where: {
                AND: [{idproject: idproject}, {class_label: segmentation_class_label}]
            }
        }) 
        const point = await polygon_config.convert_to_normalize(xy_polygon, whIMG?.width_image!, whIMG?.height_image!)
        
        if (check_label.length != 0) {
            return await prisma.polygon.update({
                where: {
                    idpolygon
                },
                data: {
                    xy_polygon: point, 
                    created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    idsegmentation: idsegmentation,
                    segmentation_class_id: check_label[0]?.class_id,
                    user_id: user_id
                }
            })
        }
        const create_label =  await prisma.segmentation_class.create({
            data: {
                class_label: segmentation_class_label,
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                idproject: idproject,
            }
        })
        return await prisma.polygon.update({
            where: {
                idpolygon
            },
            data: {
                xy_polygon: point, 
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                idsegmentation: idsegmentation,
                segmentation_class_id: create_label?.class_id,
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

export const export_polygon_YOLO = async (idsegmentation: any, allClass: any) => {
    try {
        

        const polygons = await prisma.polygon.findMany({
            where: {
                idsegmentation
            },
            select: {
                idsegmentation: true,
                idpolygon: true,
                xy_polygon: true,
                segmentation_class_id: true,
                user_id: true,
            }
        });

        const modifiedBoundingBoxes = await Promise.all(polygons.map(async polygon => ({
            idbounding_box: polygon.idpolygon,
            xy_polygon: polygon.xy_polygon?.replace(/,/g, ' '),
            segmentation_class_id: await mapClassId.segmentation_map_class(allClass, await prisma.segmentation_class.findUnique({
                                                                            where:{
                                                                                class_id: polygon.segmentation_class_id
                                                                            },
                                                                            select: {
                                                                                class_label: true
                                                                            }
                                                                            })),
            
            user_id: polygon.user_id,
        })));

        return modifiedBoundingBoxes;

        
    } catch (error) {
        console.log("export YOLO bounding_box ERROR!!")
        throw error
    }
}

export const create_import_Polygon = async (segmentation: any, user_id: any, idproject: any) => {
    try {
        for(let i = 0; segmentation.length; i++){
            const get_segmentation = await prisma.segmentation.findMany({
                where: {
                    image_path: segmentation[i].image_path,
                    idproject: idproject,
                }
            })
            await prisma.polygon.create({
                data: {
                    xy_polygon: segmentation[i].xy_polygon,
                    created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    user_id: segmentation[i].user_id,
                    idsegmentation: get_segmentation[0].idsegmentation,
                    segmentation_class_id: segmentation[i].classId
                }
            })
        }
        return 1
        
    } catch (error) {
        console.log("create import polygon ERROR!!")
        console.log("error",error)
        return 0
    }

}