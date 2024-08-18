import express, { Request, Response } from 'express';
import * as segmentationController from '../controller/segmentationController'
import * as check from '../middleware/auth'
const router = express.Router()

router.post('/create/segmentation/label', check.checkAuth, segmentationController.createSegmentationClass)
router.post('/create/segmentation/polygon', check.checkAuth, segmentationController.CRUDPolygon)
router.post('/convert/segmentation', check.checkAuth, segmentationController.segmentation_to_detection)

router.get('/segmentation/class/:idproject', check.checkAuth, segmentationController.getAllClass)
router.get('/segmentation/polygon/:idsegmentation', check.checkAuth, segmentationController.getPolygon)
router.get('/segmentation/allSegmentation/:idproject', check.checkAuth, segmentationController.getAllSegmentation)
router.get('/segmentation/getProcess/:idproject', check.checkAuth, segmentationController.get_process)

router.put('/update/segmentation/class', check.checkAuth, segmentationController.updateClass)

router.delete('/delete/segmentation/polygon', check.checkAuth, segmentationController.delpolygon)
router.delete('/delete/segmentation/class', check.checkAuth, segmentationController.delLabel)

export default router