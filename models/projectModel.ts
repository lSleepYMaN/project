import { PrismaClient } from "@prisma/client";
import fs from 'fs'
import path from "path";

const prisma = new PrismaClient()

export const createProject = async (projectName: string, projectDes: string, dir: string) => {
    try {
        return await prisma.project.create({
            data:{
                project_name: projectName,
                description: projectDes,
                root_path: dir,
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

export const getprojectById = async (id: any) => {
    try {
        return await prisma.project.findUnique({
            where:{ idproject: id },
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


export const createFolder = async (name: string, username: string) => {
    let dirname: string = name + '_' + username
    const uploadDir = path.join(__dirname, '../project_path' , dirname)
    fs.mkdirSync(uploadDir);
    
    return uploadDir as string

}

export const createDetectionFolder = async (dir: string) => {
    let pathDir = path.join(dir, 'detection', 'images')
    fs.mkdirSync(pathDir, { recursive: true });
    
    return pathDir

}
