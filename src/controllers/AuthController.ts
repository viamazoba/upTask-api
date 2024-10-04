import type { Request, Response } from "express"
import User from "../models/User"
import { hashPassword } from "../utils/auth"


export class AuthController {

  static createAccount = async (req: Request, res: Response) => {
    try {

      const { password, email } = req.body

      // Prevenir duplicados, el usuario ya existe en la db
      const userExists = await User.findOne({ email })

      if (userExists) {
        const error = new Error('User already exist')
        return res.status(409).json({ error: error.message })
      }

      // Crear usuario
      const user = new User(req.body)

      // Hash password
      user.password = await hashPassword(password)
      await user.save()

      res.send('Account created succesfully, please check your email')

    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' })
    }
  }
}