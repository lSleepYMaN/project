import express, { Request, Response } from 'express';
import * as exportFormat from '../controller/exportFormat'
import * as check from '../middleware/auth'
const router = express.Router()

router.get('/exportDetection/YOLO/:idproject', check.checkAuth, exportFormat.detection_YOLO)

export default router