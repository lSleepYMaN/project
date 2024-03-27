import { Request, Response } from "express"
import * as projectModel from '../models/projectModel'
import * as userModel from '../models/userModel'

export const createProject = async (req: Request, res: Response) => {
    const { project_name, description } = req.body

    try {
        const create = await projectModel.createProject(project_name, description)
        const userin = await projectModel.user_in_charge(req.session.userid, create.idproject, 1)
        if(!userin) {
            return res.status(500).json({ error: 'create project failed' })
        }

        return res.status(200).json({
            type: 'success',
            message: 'สร้าง project สำเร็จ',
            redirectTo: '/.....',
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create project ERROR!!' })
    }
}

export const createShareProject = async (req: Request, res: Response) => {
    const { project_name, username } = req.body

    try {
        const user = await userModel.getUsername(username)
        const project = await projectModel.getAllprojectByname(req.session.userid, project_name)
        const createShare = await projectModel.user_in_charge(user?.id, project[0].idproject, 2)

        if(!createShare) {
            return res.status(500).json({ error: 'create share failed' })
        }

        return res.status(200).json({
            type: 'success',
            message: 'สร้าง share project สำเร็จ',
            redirectTo: '/.....',
        })
        
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'create share ERROR!!' })
    }
}

export const getAllproject = async (req: Request, res: Response) => {
    const project = await projectModel.getAllproject(req.session.userid, 1)

    console.log(project)
    return res.json(project)
} 

export const getShareproject = async (req: Request, res: Response) => {
    const project = await projectModel.getAllproject(req.session.userid, 2)

    console.log(project)
    return res.json(project)
} 