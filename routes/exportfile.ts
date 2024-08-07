import express, { Request, Response } from 'express';
import * as exportFormat from '../controller/exportFormat'
import * as check from '../middleware/auth'
const router = express.Router()

router.post('/export/format', check.checkAuth, exportFormat.exportAllFormat)
router.post('/export/format/download', check.checkAuth, exportFormat.downloadFile)

export default router