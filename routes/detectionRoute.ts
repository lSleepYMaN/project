import express, { Request, Response } from 'express';
import * as projectController from '../controller/detectionController'
import * as check from '../middleware/auth'
const router = express.Router()

router.post('/create/detection/label', check.checkAuth, projectController.createDetectionClass)
router.post('/create/detection', check.checkAuth, projectController.createDetection)
router.get('/detection/class', check.checkAuth, projectController.getAllClass)

export default router