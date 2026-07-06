import express from 'express'
import { signup, signin, getProfile } from '../controllers/auth.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { loginRateLimiter } from '../middlewares/rateLimiter.middleware.js'
import { validateSignup, validateSignin } from '../validators/auth.validator.js'

const router = express.Router()

router.route('/signup').post(validateSignup, signup)
router.route('/signin').post(loginRateLimiter, validateSignin, signin)
router.route('/profile').get(verifyJWT, getProfile)

export { router as authRouter }
