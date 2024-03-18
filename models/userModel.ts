import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const allUser = async () => {
    try {
        return await prisma.user.findMany()

    } catch (error) {
        console.log("Get all user is ERROR!!")
        throw error
    }
}

export const userById = async (id: number) => {
    try {
        return await prisma.user.findUnique({
            where : { id }
        })

    } catch (error) {
        console.log("Get user by id is ERROR!!")
        throw error
    }
} 

export const createUser = async (username: string, email: string, password: string, code: string) => {
    try {
        return await prisma.user.create({
            data: {
                username,
                email,
                password,
                created_at: new Date(),
                updated_at: new Date(),
                verified_code: code
            }
        })
        
    } catch (error) {
        console.log("Create user ERROR!!")
        throw error
    }
}

export const updateTimeUser = async (username: string) => {
    try {
        return await prisma.user.update({
            where: { username },
            data: { updated_at: new Date() }
        })
        
    } catch (error) {
        console.log("Update time ERROR!!")
        throw error
    }
}

export const getUsername = async (username: string) => {
    try{
        return await prisma.user.findUnique({
            where:{ username },
        })

    }catch(error) {
        console.log("Get username ERROR!! ")
        throw error
    }
}

export const getEmail = async (email: string) => {
    try {
        return await prisma.user.findUnique({
            where: { email }
        })
    } catch (error) {
        console.log("Get email ERROR!! ")
        throw error
    }
}
