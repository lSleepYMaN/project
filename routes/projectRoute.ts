import express, { Request, Response } from 'express';
import * as projectController from '../controller/projectController'
import * as check from '../middleware/auth'
import multer from "multer";
const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/create/project', check.checkAuth, projectController.createProject)
router.get('/allProject', check.checkAuth, projectController.getAllproject)
router.post('/shareProject', check.checkAuth, projectController.createShareProject)
router.get('/allProject/share', check.checkAuth, projectController.getShareproject)
router.post('/uploadImage', check.checkAuth, upload.array('image'), projectController.uploadImage)
router.get('/project/:id', projectController.getprojectById )
router.get('/images/pull', check.checkAuth, projectController.pullImage)
router.delete('/delete/project', check.checkAuth, projectController.deleteProject)

export default router