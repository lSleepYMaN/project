import { PrismaClient } from "@prisma/client";
import { dir } from "console";
import fs from 'fs'
import path from "path";

const prisma = new PrismaClient()

export const createProject = async (projectName: string, projectDes: string) => {
    try {
        return await prisma.project.create({
            data:{
                project_name: projectName,
                description: projectDes,
                root_path: "-",
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
            }
        })
        
    } catch (error) {
        console.log("create project is ERROR!!")
        throw error
    }
}

export const root_pathUP = async (idproject: any) => {
    try {
        return await prisma.project.update({
            where: {
                idproject: idproject,
            },
            data: {
                root_path: idproject.toString(),
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

export const deleteProject = async (id: any) => {
    try {
        await prisma.detection.deleteMany({
            where: {idproject: id}
        })
        await prisma.detection_class.deleteMany({
            where: {idproject: id}
        })
        await prisma.segmentation.deleteMany({
            where: {idproject: id}
        })
        await prisma.segmentation_class.deleteMany({
            where: {idproject: id}
        })
        await prisma.project.delete({
            where: {idproject: id}
        })

        return true
        
    } catch (error) {
        console.log("delete project is ERROR!!")
        throw error
    }
}

export const deleteUser_in_charge = async (id: any) => {
    try {
        return await prisma.user_in_charge.deleteMany({
            where: {idproject: id}
        })
        
    } catch (error) {
        console.log("delete user_in_charge is ERROR!!")
        throw error
    }
}

export const createFolder = async (idproject: any) => {
    let dirname: string = idproject.toString()
    const uploadDir1 = path.join(__dirname, '../project_path' , dirname, 'images')
    const uploadDir2 = path.join(__dirname, '../project_path' , dirname, 'thumbs')
    fs.mkdirSync(uploadDir1, { recursive: true });
    fs.mkdirSync(uploadDir2, { recursive: true });
    
    return dirname as string

}

export const deleteFolder = async (dir: string) => {
    const projectPath = path.join(__dirname, '../project_path', dir);
    const projectPathIM = path.join(projectPath, 'images');
    const projectPathTH = path.join(projectPath, 'thumbs');

    try {
        if (await fs.readdirSync(projectPathIM)) {
            for (const file of await fs.readdirSync(projectPathIM)) {
                const filePath = path.join(projectPathIM, file);
                await fs.unlinkSync(filePath);
            }
            await fs.rmdirSync(projectPathIM);
        }

        if (await fs.readdirSync(projectPathTH)) {
            for (const file of await fs.readdirSync(projectPathTH)) {
                const filePath = path.join(projectPathTH, file);
                await fs.unlinkSync(filePath);
            }
            await fs.rmdirSync(projectPathTH);
        }

        if (fs.existsSync(projectPath)) {
            await fs.rmdirSync(projectPath);
        }

        console.log(`Folder ${dir} deleted successfully.`);
        return true;
        
    } catch (error) {
        console.error('Error deleting folder:', error);
        throw error;
    }
}




