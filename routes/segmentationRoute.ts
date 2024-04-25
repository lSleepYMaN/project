import express, { Request, Response } from 'express';
import * as segmentationController from '../controller/segmentationController'
import * as check from '../middleware/auth'
const router = express.Router()

router.post('/create/segmentation/label', check.checkAuth, segmentationController.createSegmentationClass)
router.post('/create/segmentation/polygon', check.checkAuth, segmentationController.createPolygon)

router.get('/segmentation/class', check.checkAuth, segmentationController.getAllClass)
router.get('/segmentation/polygon', check.checkAuth, segmentationController.getPolygon)
router.get('/segmentation/allSegmentation', check.checkAuth, segmentationController.getAllSegmentation)

router.put('/update/segmentation/polygon', check.checkAuth, segmentationController.updatePolygon)

router.delete('/delete/segmentation/polygon', check.checkAuth, segmentationController.delpolygon)

export default router