import { body, validationResult } from 'express-validator'
import ApiError from '../utils/ApiError.js'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }))
    return next(new ApiError(400, 'Validation failed', formattedErrors))
  }

  next()
}

export const validateSignup = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Name must be between 3 and 30 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .escape(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one digit'
    ),
  handleValidationErrors,
]

export const validateSignin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .escape(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
]
