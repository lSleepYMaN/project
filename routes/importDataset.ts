import express, { Request, Response } from 'express';
import * as uploadFormat from '../controller/uploadFormat'
import * as check from '../middleware/auth'
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
const router = express.Router()

router.post('/import/detection/YOLO', upload.single('file'), uploadFormat.YOLO_detection)

export default router