import express, { Request, Response } from 'express';
import * as userController from '../controller/userController'
import * as check from '../middleware/auth'

const router = express.Router()

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.post('/verify', userController.verifyUser)
router.post('/sendnewcode',userController.sendNewCode)
router.post('/forgetPassword',userController.forgetPass)
router.post('/newPassword', userController.newPassword)

router.get('/logout',userController.logoutUser)
router.get('/users',check.checkAuth, userController.getAllUsers)
router.get('/user/:id', userController.getUserById)
router.get('/test', userController.testSession)
router.get('/returnUsername', check.checkAuth, userController.returnUsername)

export default router