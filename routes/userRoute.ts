import express, { Request, Response } from 'express';
import * as userController from '../controller/userController'
import * as check from '../middleware/auth'
const router = express.Router()

router.get('/users',check.checkAuth, userController.getAllUsers)
router.get('/user/:id', userController.getUserById)
router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.post('/verify',userController.verifyUser)
router.post('/logout',userController.logoutUser)
router.post('/sendnewcode',userController.sendNewCode)

export default router