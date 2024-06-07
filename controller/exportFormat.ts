import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express"
import * as detectionModel from '../models/detectionModel'
import { dir } from "console";
import fs from 'fs'
import path from "path";
import sharp from 'sharp'
const prisma = new PrismaClient()

export const detection_YOLO = async (req: Request, res: Response) => {
    try {
        const idproject = parseInt(req.params.idproject)
        const label = await detectionModel.getAllLabel(idproject)
        const detection = await detectionModel.getAllDetection(idproject)
        const allClass: string[] = []

        for(let i = 0; i < label.length; i++){
            allClass.push(label[i].class_label)
        }

        for(let i = 0; i < detection.length; i++){
            const bbox = await detectionModel.export_bbox_YOLO(detection[i].iddetection, allClass) 
            console.log(bbox)
        }

        
        
    } catch (error) {
        
    }
    

}