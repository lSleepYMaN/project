import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
import fs from 'fs'
import path from "path";

export const createClass = async (idproject: any, class_label: string) => {
    try {
        let index
        const check_class = await prisma.classification_class.findMany({
            where: {
                idproject
            },
            orderBy: {
                class_index: 'asc'
            }
        })

        if (check_class.length == 0) {
            index = 0
        }else{
            for(let i = 0; i < check_class.length; i++){
                if (i != check_class[i].class_index) {
                    index = i
                    break;
                } else {
                    index = check_class.length
                }
            }
        }

        return await prisma.classification_class.create({
            data:{
                class_label: class_label,
                class_index: index as number,
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
                idproject
            }
        })
        
    } catch (error) {
        console.log("Create class classification ERROR!!")
        throw error
    }
}

export const getClass = async (idproject: any, class_label: string) => {
    try {
        return await prisma.classification_class.findMany({
            where:{
                idproject, class_label
            }
        })
        
    } catch (error) {
        console.log("get class classification ERROR!!")
        throw error
    }
}

export const getAllClass = async (idproject: any) => {
    try {
        return await prisma.classification_class.findMany({
            where:{
                idproject
            },
            select:{
                class_index: true,
                class_label: true,
            },
            orderBy: {
                class_index: 'asc'
            }
        })
        
    } catch (error) {
        console.log("get class classification ERROR!!")
        throw error
    }
}

export const updateClass = async (idproject: any, index: any, class_label: any) => {
    try {
        const id = await prisma.classification_class.findMany({
            where:{
                idproject, class_index: index
            }
        })
        return await prisma.classification_class.update({
            where:{
                class_id: id[0].class_id
            },
            data:{
                class_label
            }
        })
        
    } catch (error) {
        console.log("get class classification ERROR!!")
        throw error
    }
}

export const delClass = async (idproject: any, index: any) => {
    try {
        const id = await prisma.classification_class.findMany({
            where:{
                idproject, class_index: index
            }
        })
        await prisma.classification_class.delete({
            where:{
                class_id: id[0].class_id
            }
        })

        const dir = path.join(__dirname, '../project_path' , `${idproject}`, 'classification', `${id[0].class_index}`)

        if (await fs.readdirSync(dir)) {
            for (const file of await fs.readdirSync(dir)) {
                const filePath = path.join(dir, file);
                await fs.unlinkSync(filePath);
            }
            await fs.rmdirSync(dir);
        }

        return true
        
    } catch (error) {
        console.log("Delete class classification ERROR!!")
        return true
    } 
}