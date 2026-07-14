import jwt from 'jsonwebtoken'
import ApiError from './ApiError.js'

const ACCESS_SECRET = process.env.ACCESS_SECRET
const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || '1h'

export const generateAccessToken = (user) => {
  if (!ACCESS_SECRET) {
    throw new ApiError(500, 'Server configuration error')
  }

  return jwt.sign(
    {
      sub: user.id.toString(),
      role: user.role,
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  )
}

export const verifyAccessToken = (token) => {
  if (!ACCESS_SECRET) {
    throw new ApiError(500, 'Server configuration error')
  }

  try {
    return jwt.verify(token, ACCESS_SECRET)
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token has expired')
    }
    throw new ApiError(401, 'Invalid access token')
  }
}
