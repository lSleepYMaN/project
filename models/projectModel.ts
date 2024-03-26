import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const createProject = async (projectName: string, projectDes: string) => {
    try {
        return await prisma.project.create({
            data:{
                project_name: projectName,
                description: projectDes,
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
            }
        })
        
    } catch (error) {
        console.log("create project is ERROR!!")
        throw error
    }
}

export const user_in_charge = async (userId: any, projectId: any) => {
    try {
        await prisma.user_in_charge.create({
            data:{
                has_allow: 1,
                user_id: userId,
                idproject: projectId
            }
        })
        return 1
        
    } catch (error) {
        console.log("create user_in_charge is ERROR!!")
        throw error
    }
}