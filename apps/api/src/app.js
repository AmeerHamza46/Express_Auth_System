import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app = express()
import { userRouter } from './routes/user.route.js'
import { authRouter } from './routes/auth.route.js'
import { errorHandler } from './middlewares/error.middleware.js'

// middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended : true, limit: '16kb' }))
app. use(express.static( 'public'))
app.use(cookieParser())


// routes
app.use('/api/v1/users', userRouter)
app.use('/api/v1/auth', authRouter)

// error handler
app.use(errorHandler)

export { app }