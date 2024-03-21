import express from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoute'
import session from 'express-session'
import cookie from 'cookie-parser'
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookie())
app.use(userRoutes)

app.listen(5000, () => {
    console.log('Server is running on port 5000')
})