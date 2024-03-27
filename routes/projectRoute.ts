import express, { Request, Response } from 'express';
import * as projectController from '../controller/projectController'
import * as check from '../middleware/auth'
const router = express.Router()

router.post('/createProject', check.checkAuth, projectController.createProject)
router.get('/allProject', check.checkAuth, projectController.getAllproject)
router.post('/shareProject', check.checkAuth, projectController.createShareProject)
router.get('/allProject/share', check.checkAuth, projectController.getShareproject)

export default router