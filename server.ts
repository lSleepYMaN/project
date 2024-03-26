import express from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoute'
import projectRoutes from './routes/projectRoute'
import session from 'express-session'
import cookie from 'cookie-parser'
const app = express()

app.use(session({
  secret: '123456789',
  resave: false,
  saveUninitialized: true
}));

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookie())
app.use(userRoutes, projectRoutes)


app.listen(5000, () => {
    console.log('Server is running on port 5000')
})