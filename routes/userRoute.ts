import express, { Request, Response } from 'express';
import * as userController from '../controller/userController'
import * as check from '../middleware/auth'

const router = express.Router()

router.get('/users',check.checkAuth, userController.getAllUsers)
router.get('/user/:id', userController.getUserById)
router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.post('/verify', check.checkAuth, userController.verifyUser)
router.post('/logout',userController.logoutUser)
router.post('/sendnewcode',userController.sendNewCode)
router.post('/forgetPassword',userController.forgetPass)
router.post('/newPassword',check.checkAuth2, userController.newPassword)
router.get('/test', userController.testSession)

export default router