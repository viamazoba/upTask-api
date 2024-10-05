import type { Request, Response } from "express"
import User from "../models/User"
import { hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"


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

      // Generar Token
      const token = new Token()
      token.token = generateToken()
      token.user = user.id

      // Enviar el email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      })

      await Promise.allSettled([user.save(), token.save()])

      res.send('Account created succesfully, please check your email')

    } catch (error) {
      res.status(500).json({ error: 'There was an error' })
    }
  }

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body

      const tokenExist = await Token.findOne({ token })

      if (!tokenExist) {
        const error = new Error('Invalid Token')
        return res.status(401).json({ error: error.message })
      }

      const user = await User.findById(tokenExist.user)
      user.confirmed = true

      await Promise.allSettled([user.save(), tokenExist.deleteOne()])
      res.send('Account has been confirm sucessfully')

    } catch (error) {
      res.status(500).json({ error: 'There was an error' })
    }
  }
}