import express from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoute'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(userRoutes)

app.listen(5000, () => {
    console.log('Server is running on port 5000')
})