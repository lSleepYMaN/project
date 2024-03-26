import { Request, Response } from "express"
import * as projectModel from '../models/projectModel'

export const createProject = async (req: Request, res: Response) => {
    const { project_name, description } = req.body

    try {
        const create = await projectModel.createProject(project_name, description)
        const userin = await projectModel.user_in_charge(req.session.userid, create.idproject)
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