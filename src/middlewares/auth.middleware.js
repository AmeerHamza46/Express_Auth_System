import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import { verifyAccessToken } from '../utils/jwt.js'
import { User } from '../models/user.model.js'

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authorization token is required')
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    throw new ApiError(401, 'Authorization token is required')
  }

  const decoded = verifyAccessToken(token)

  const user = await User.findById(decoded.sub).select(
    '-password -passwordChangedAt'
  )

  if (!user) {
    throw new ApiError(401, 'Invalid access token')
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated')
  }

  req.user = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
    profilePicture: user.profilePicture,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }

  next()
})
