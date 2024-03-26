import express, { Request, Response } from 'express';
import * as projectController from '../controller/projectController'
import * as check from '../middleware/auth'
const router = express.Router()

router.post('/createProject',check.checkAuth,projectController.createProject)

export default router