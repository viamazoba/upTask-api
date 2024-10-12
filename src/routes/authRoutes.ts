import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";

const router = Router()

router.post('/create-account',
  body('name').notEmpty().withMessage('Name can\'t be empty'),
  body('password').isLength({ min: 8 }).withMessage('Password minimun length is eight'),
  body('password_confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwaords are not equal')
    }

    return true
  }),
  body('email').notEmpty().withMessage('Email not valid'),
  handleInputErrors,
  AuthController.createAccount
)

router.post('/confirm-account',
  body('token').notEmpty().withMessage('Token can\'t be empty'),
  handleInputErrors,
  AuthController.confirmAccount
)

router.post('/login',
  body('email').notEmpty().withMessage('Email not valid'),
  body('password').notEmpty().withMessage('Password can\'t be empty'),
  handleInputErrors,
  AuthController.login
)


router.post('/request-code',
  body('email').notEmpty().withMessage('Email not valid'),
  handleInputErrors,
  AuthController.requestConfirmationCode
)

router.post('/forgot-password',
  body('email').notEmpty().withMessage('Email not valid'),
  handleInputErrors,
  AuthController.forgotPassword
)

router.post('/validate-token',
  body('token').notEmpty().withMessage('Token can\'t be empty'),
  handleInputErrors,
  AuthController.validateToken
)

router.post('/update-password/:token',
  param('token').isNumeric().withMessage('Invalid Token'),
  body('password').isLength({ min: 8 }).withMessage('Password minimun length is eight'),
  body('password_confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwaords are not equal')
    }

    return true
  }),
  handleInputErrors,
  AuthController.updatePasswordWithToken
)

export default router