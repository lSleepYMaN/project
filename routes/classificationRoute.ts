import express, { Request, Response } from 'express';
import * as classificationController from '../controller/classificationController'
import * as check from '../middleware/auth'
import multer from "multer";
const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.get('/classification/class/:idproject', check.checkAuth, classificationController.getAllClass)

router.post('/create/classification/label', check.checkAuth, classificationController.createClassificationClass)
router.post('/classification/uploadImage', check.checkAuth, upload.array('image'), classificationController.uploadImage)
router.post('/classification/getImg', check.checkAuth, classificationController.getIMG)

export default router