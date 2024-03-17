import express from 'express'
import * as userController from '../controller/userController'

const router = express.Router()

router.get('/users', userController.getAllUsers)
router.get('/user/:id', userController.getUserById)
router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)

export default router