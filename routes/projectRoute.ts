import express, { Request, Response } from 'express';
import * as projectController from '../controller/projectController'
import * as check from '../middleware/auth'
import multer from "multer";
const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/createProject', check.checkAuth, projectController.createProject)
router.get('/allProject', check.checkAuth, projectController.getAllproject)
router.post('/shareProject', check.checkAuth, projectController.createShareProject)
router.get('/allProject/share', check.checkAuth, projectController.getShareproject)
//router.post('/uploadImage', check.checkAuth, upload.single('image'), projectController.uploadImage)

export default router