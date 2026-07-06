import ApiError from '../utils/ApiError.js'

export const errorHandler = (err, req, res, next) => {
  let error = err

  if (!(error instanceof ApiError)) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }))
      error = new ApiError(400, 'Validation failed', errors)
    } else if (error.code === 11000) {
      error = new ApiError(409, 'User already exists')
    } else if (error.name === 'JsonWebTokenError') {
      error = new ApiError(401, 'Invalid access token')
    } else if (error.name === 'TokenExpiredError') {
      error = new ApiError(401, 'Access token has expired')
    } else {
      console.error(error)
      error = new ApiError(500, 'Internal server error')
    }
  }

  return res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    data: null,
  })
}
