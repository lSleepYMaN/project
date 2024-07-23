import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

export const createClass = async (idproject: any, class_label: string) => {
    try {
        let index
        const check_class = await prisma.classification_class.findMany({
            where: {
                idproject
            }
        })

        if (check_class.length == 0) {
            index = 0
        }else{
            index = check_class.length
        }

        return await  prisma.classification_class.create({
            data:{
                class_label: class_label,
                class_index: index,
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
            }
        })
        
    } catch (error) {
        console.log("get class classification ERROR!!")
        throw error
    }
}