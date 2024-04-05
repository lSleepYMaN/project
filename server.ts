import express from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoute'
import projectRoutes from './routes/projectRoute'
import session from 'express-session'
import dotenv from 'dotenv'
const cookie = require('cookie-parser')

dotenv.config()
const app = express()

app.use(session({
  secret: '123456789',
  resave: false,
  saveUninitialized: true
}));

app.use('/img', express.static('project_path'))
app.use(cors({ origin: `${process.env.ORIGIN_URL}`, credentials: true}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookie())
app.use(userRoutes, projectRoutes)


app.listen(5000, () => {
    console.log('Server is running on port 5000')
})