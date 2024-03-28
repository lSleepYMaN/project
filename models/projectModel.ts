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

export const user_in_charge = async (userId: any, projectId: any, status: any) => {
    try {
        await prisma.user_in_charge.create({
            data:{
                has_allow: status,
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

export const getAllproject = async (id: any, status: any) => {
    try {
        return await prisma.project.findMany({
            where:{ user_in_charge: {some: {user_id : id, has_allow: status}}},
            select: {
                idproject: true,
                project_name: true,
                description: true,
                root_path: true,
            }
        })
    } catch (error) {
        console.log("get project is ERROR!!")
        throw error
    }
}

export const getAllprojectByname = async (id: any, name: string, status: any) => {
    try {
        return await prisma.project.findMany({
            where:{ user_in_charge: {some: {user_id : id, has_allow: status}}, project_name: name },
            select: {
                idproject: true,
                project_name: true,
                description: true,
                root_path: true,
            }
        })
    } catch (error) {
        console.log("get project is ERROR!!")
        throw error
    }
}

export const getProjectByname = async (id: any, name: string) => {
    try {
        return await prisma.project.findMany({
            where:{ user_in_charge: {some: {user_id : id}}, project_name: name },
            select: {
                idproject: true,
                project_name: true,
                description: true,
                root_path: true,
            }
        })
    } catch (error) {
        console.log("get project is ERROR!!")
        throw error
    }
}

