import express, { Request, Response } from 'express';
import * as detectionController from '../controller/detectionController'
import * as check from '../middleware/auth'
const router = express.Router()

router.post('/create/detection/label', check.checkAuth, detectionController.createDetectionClass)
router.post('/create/detection/bounding_box', check.checkAuth, detectionController.createBounding_box)

router.get('/detection/class', check.checkAuth, detectionController.getAllClass)
router.get('/detection/bounding_box/:iddetection', check.checkAuth, detectionController.getBounding_box)
router.get('/detection/allDetection/:idproject', check.checkAuth, detectionController.getAllDetection)
router.get('/detection/class/:class_id', check.checkAuth, detectionController.getClass)

router.put('/update/detection/bounding_box', check.checkAuth, detectionController.updateBounding_box)

router.delete('/delete/detection/bounding_box', check.checkAuth, detectionController.delBounding_box)

export default router