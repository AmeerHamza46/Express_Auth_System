import express from 'express'
import {
  signup,
  signin,
  getProfile,
  verifyEmail,
  resendVerificationOtp,
} from '../controllers/auth.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
  loginRateLimiter,
  otpRateLimiter,
} from '../middlewares/rateLimiter.middleware.js'
import {
  validateSignup,
  validateSignin,
  validateVerifyEmail,
  validateResendOtp,
} from '../validators/auth.validator.js'

const router = express.Router()

router.route('/signup').post(validateSignup, signup)
router.route('/signin').post(loginRateLimiter, validateSignin, signin)
router.route('/verify-email').post(otpRateLimiter, validateVerifyEmail, verifyEmail)
router
  .route('/resend-otp')
  .post(otpRateLimiter, validateResendOtp, resendVerificationOtp)
router.route('/profile').get(verifyJWT, getProfile)

export { router as authRouter }
