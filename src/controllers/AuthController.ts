import type { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
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
        return res.status(404).json({ error: error.message })
      }

      const user = await User.findById(tokenExist.user)
      user.confirmed = true

      await Promise.allSettled([user.save(), tokenExist.deleteOne()])
      res.send('Account has been confirm sucessfully')

    } catch (error) {
      res.status(500).json({ error: 'There was an error' })
    }
  }

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body
      const user = await User.findOne({ email })

      if (!user) {
        const error = new Error('Invalid User')
        return res.status(404).json({ error: error.message })
      }

      if (!user.confirmed) {
        const token = new Token()
        token.user = user.id
        token.token = generateToken()
        await token.save()

        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token
        })

        const error = new Error('Account is not confirm, We sent a new code at your email')
        return res.status(401).json({ error: error.message })
      }

      // Revisar Password
      const isPasswordCorrect = await checkPassword(password, user.password)

      if (!isPasswordCorrect) {
        const error = new Error('Incorrect Password')
        return res.status(401).json({ error: error.message })
      }

      res.send('Authentication was successfully')

    } catch (error) {
      res.status(500).json({ error: 'There was an error' })
    }
  }

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {

      const { email } = req.body

      // Usuario Existe
      const user = await User.findOne({ email })

      if (!user) {
        const error = new Error('User doesn\'t exist')
        return res.status(404).json({ error: error.message })
      }

      if (user.confirmed) {
        const error = Error('User has already confirmed the account')
        return res.status(403).json({ error: error.message })
      }


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

      res.send('We sent a new token at your e-mail')

    } catch (error) {
      res.status(500).json({ error: 'There was an error' })
    }
  }
}