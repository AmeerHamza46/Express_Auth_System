import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js'
import { generateAccessToken } from '../utils/jwt.js'
import { generateOtp, getOtpExpiry, hashOtp, verifyOtp } from '../utils/otp.js'
import { sendVerificationOtpEmail } from '../utils/email.js'

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  isActive: user.isActive,
  profilePicture: user.profilePicture,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

async function issueAndSendOtp(user) {
  const otp = generateOtp()
  user.emailOtp = await hashOtp(otp)
  user.emailOtpExpiresAt = getOtpExpiry()
  await user.save({ validateBeforeSave: false })

  await sendVerificationOtpEmail({
    to: user.email,
    otp,
    username: user.username,
  })
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    if (existingUser.isVerified) {
      throw new ApiError(409, 'User already exists')
    }

    existingUser.username = name
    existingUser.password = password
    await existingUser.save()
    await issueAndSendOtp(existingUser)

    return res.status(200).json(
      new ApiResponse(
        200,
        { user: sanitizeUser(existingUser), requiresVerification: true },
        'Account already exists but is unverified. A new verification code has been sent.'
      )
    )
  }

  const user = await User.create({
    username: name,
    email,
    password,
  })

  try {
    await issueAndSendOtp(user)
  } catch (error) {
    await User.deleteOne({ _id: user._id })
    throw error
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: sanitizeUser(user), requiresVerification: true },
      'User registered successfully. Please verify your email with the code we sent.'
    )
  )
})

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  const user = await User.findOne({ email }).select('+emailOtp +emailOtpExpiresAt')
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  if (user.isVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, { user: sanitizeUser(user) }, 'Email is already verified'))
  }

  if (!user.emailOtp || !user.emailOtpExpiresAt || user.emailOtpExpiresAt < new Date()) {
    throw new ApiError(400, 'Verification code has expired. Please request a new one.')
  }

  const isValid = await verifyOtp(otp, user.emailOtp)
  if (!isValid) {
    throw new ApiError(400, 'Invalid verification code')
  }

  user.isVerified = true
  user.emailOtp = null
  user.emailOtpExpiresAt = null
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, { user: sanitizeUser(user) }, 'Email verified successfully'))
})

export const resendVerificationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email }).select('+emailOtp +emailOtpExpiresAt')
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  if (user.isVerified) {
    throw new ApiError(400, 'Email is already verified')
  }

  await issueAndSendOtp(user)

  return res
    .status(200)
    .json(new ApiResponse(200, { email: user.email }, 'Verification code sent'))
})

export const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, 'Invalid email or password')
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated')
  }

  if (!user.isVerified) {
    throw new ApiError(
      403,
      'Please verify your email before signing in',
      [],
      '',
      'EMAIL_NOT_VERIFIED'
    )
  }

  user.lastLoginAt = new Date()
  await user.save({ validateBeforeSave: false })

  const accessToken = generateAccessToken(user)

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: sanitizeUser(user),
        accessToken,
      },
      'Login successful'
    )
  )
})

export const getProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, 'Profile fetched successfully'))
})
