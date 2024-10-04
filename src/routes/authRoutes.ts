import { Router } from "express";
import { body } from "express-validator";
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

export default router