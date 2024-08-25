import { PrismaClient } from "@prisma/client";
import { dir } from "console";
import fs from 'fs'
import path from "path";
import Jimp from 'jimp';
import * as polygon_config from '../utils/polygon_config'
import * as mapClassId from '../utils/mapClassId'
import * as detectionModel from '../models/detectionModel'
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
        const segmentations = await prisma.segmentation.findMany({
            where: {idproject: idproject},
            select: {
                idsegmentation: true,
                image_path: true,
                height_image: true,
                width_image: true,
            }
        })

        return await Promise.all(segmentations.map(async segmentation => ({
            idsegmentation: segmentation.idsegmentation,
            image_path: segmentation.image_path,
            height_image: segmentation.height_image,
            width_image: segmentation.width_image,
            polygon: await checkHavepolygon(segmentation.idsegmentation)

        })));
        
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
            const img = await Jimp.read(imagePath);

        const width = img.bitmap.width;
        const height = img.bitmap.height;

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

export const delSegmentationbyId = async (idsegmentation: any) => {
    try {
        const check_bbox = await prisma.polygon.findMany({
            where: {
                idsegmentation
            }
        })
        if (check_bbox.length != 0) {
            await prisma.polygon.deleteMany({
                where: {
                    idsegmentation
                }
            })
        }

        return await prisma.segmentation.delete({
            where: {
                idsegmentation
            }
        })
    } catch (error) {
        console.log("delete segmentation ERROR!!")
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
        const create_label2 =  await prisma.detection_class.create({
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
        const create_label2 =  await prisma.detection_class.create({
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

export const export_polygon_COCO = async (idsegmentation: any, allClass: any) => {
    try {
        const whIMG = await prisma.segmentation.findUnique({
            where: {
                idsegmentation
            }
        })

        const boundingBoxes = await prisma.polygon.findMany({
            where: {
                idsegmentation
            },
            select: {
                idpolygon: true,
                xy_polygon: true,
                segmentation_class_id: true,
                user_id: true,
            }
        });

        const modifiedPolygon = await Promise.all(boundingBoxes.map(async polygon => ({
            idbounding_box: polygon.idpolygon,
            xy_polygon: await polygon_config.convert_to_normal_number(polygon.xy_polygon!, whIMG?.width_image, whIMG?.height_image),
            segmentation_class_id: await mapClassId.segmentation_map_class(allClass, await prisma.segmentation_class.findUnique({
                                                                            where:{
                                                                                class_id: polygon.segmentation_class_id
                                                                            },
                                                                            select: {
                                                                                class_label: true
                                                                            }
                                                                            })),
            bbox_data: await polygon_config.convert_to_bbox(await polygon_config.convert_to_normal_number(polygon.xy_polygon!, whIMG?.width_image, whIMG?.height_image)),          
            user_id: polygon.user_id,
        })));

        return modifiedPolygon;

        
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

export const segmentation_to_detection = async (idproject: any, user_id: any) => {
    try {
        const allClassSeg = await getAllLabel(idproject)
        let bbox_num = 0
        for(let i = 0; i < allClassSeg.length; i++) {
            const detectionClass = await detectionModel.getlabelName(idproject, allClassSeg[i].class_label)
            const polygons = await prisma.polygon.findMany({
                where: {
                    segmentation_class_id: allClassSeg[i].class_id
                }
            })
            await prisma.bounding_box.deleteMany({
                where: {
                    detection_class_id: detectionClass[0].class_id
                }
            })
            for(let j = 0; j < polygons.length; j++) {
                const getImg_path = await prisma.segmentation.findUnique({
                    where: {
                        idsegmentation: polygons[j].idsegmentation
                    }
                })
                const detection = await prisma.detection.findMany({
                    where: {
                      idproject,
                      image_path: getImg_path?.image_path
                    }
                });
                const bbox = await polygon_config.convert_to_bbox(await polygon_config.convert_to_normal_number(polygons[j].xy_polygon!, getImg_path?.width_image, getImg_path?.height_image))
                const create_bbox = await prisma.bounding_box.create({
                    data: {
                    x1: bbox.xMin/detection[0].width_image!,
                    x2: (bbox.xMin + bbox.width)/detection[0].width_image!,
                    y1: bbox.yMin/detection[0].height_image!,
                    y2: (bbox.yMin + bbox.height)/detection[0].height_image!,
                    created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                    iddetection: detection[0].iddetection,
                    detection_class_id: detectionClass[0].class_id,
                    user_id: user_id
                    }
                })

                bbox_num ++
            }
            
        }

        return bbox_num
        
    } catch (error) {
        console.log("Convert segmentation to detection ERROR!!")
        throw error
    }
}

export const get_process = async (idproject: any) => {
    try {
        const segmentation = await prisma.segmentation.findMany({
            where: {
                idproject
            }
        })

        const process = await prisma.segmentation.groupBy({
            by: ['idsegmentation'],
            where: {
                idproject,
                polygon: {
                    some: {}
                }
            },
            _count: true
        })

        const total = segmentation.length
        const inProcess = process.length

        return {total, inProcess}
        
    } catch (error) {
        console.log("get process in segmentation ERROR!!")
        throw error
    }
}

export const checkHavepolygon = async (idsegmentation: any) => {
    try {
        const check = await prisma.polygon.findMany({
            where: {
                idsegmentation
            }
        })

        if (check.length > 0) {
            return 1
        } else {
            return 0
        }
        
    } catch (error) {
        console.log("check have polygon ERROR!!")
        throw error
    }
}