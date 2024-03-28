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

export const userById = async (id: any) => {
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
                created_at: new Date(new Date().getTime()+(7*60*60*1000)),
                updated_at: new Date(new Date().getTime()+(7*60*60*1000)),
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
            data: { updated_at: new Date(new Date().getTime()+(7*60*60*1000)) }
        })
        
    } catch (error) {
        console.log("Update time ERROR!!")
        throw error
    }
}

export const updatePassUser = async (id: any, newPassword: string) => {
    try {
        return await prisma.user.update({
            where: { id },
            data: { password: newPassword }
        })
        
    } catch (error) {
        console.log("Update password ERROR!!")
        throw error
    }
}

export const updateStatusTo0 = async (id: any) => {
    try {
        return await prisma.user.update({
            where: { id },
            data: { status: 0}
        })

    
    } catch (error) {
        console.log("Update status ERROR!!")
        throw error
    }
}

export const updateStatusTo1 = async (username: string) => {
    try {
        return await prisma.user.update({
            where: { username },
            data: { status: 1}
        })

    
    } catch (error) {
        console.log("Update status ERROR!!")
        throw error
    }
}

export const updateVerifyCodeTonull = async (id: any) => {
    try {
        return await prisma.user.update({
            where: { id },
            data: { verified_code: null }
        })
        
    } catch (error) {
        console.log("Update verify ERROR!!")
        throw error
    }
}

export const updateVerifyCode = async (id: any, code: string) => {
    try {
        return await prisma.user.update({
            where: { id },
            data: { verified_code: code }
        })
        
    } catch (error) {
        console.log("Update verify ERROR!!")
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
