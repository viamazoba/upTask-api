import type { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"


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

      const token = generateJWT({
        id: user.id
      })
      res.send(token)

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

  static forgotPassword = async (req: Request, res: Response) => {
    try {

      const { email } = req.body

      // Usuario Existe
      const user = await User.findOne({ email })

      if (!user) {
        const error = new Error('User doesn\'t exist')
        return res.status(404).json({ error: error.message })
      }


      // Generar Token
      const token = new Token()
      token.token = generateToken()
      token.user = user.id
      await token.save()

      // Enviar el email
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token
      })

      res.send('We sent you an e-mail with instructions')

    } catch (error) {
      res.status(500).json({ error: 'There was an error' })
    }
  }

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body

      const tokenExist = await Token.findOne({ token })

      if (!tokenExist) {
        const error = new Error('Invalid Token')
        return res.status(404).json({ error: error.message })
      }

      res.send('Valid Token, please define a new Password')

    } catch (error) {
      res.status(500).json({ error: 'There was an error' })
    }
  }

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params

      const tokenExist = await Token.findOne({ token })

      if (!tokenExist) {
        const error = new Error('Invalid Token')
        return res.status(404).json({ error: error.message })
      }

      const user = await User.findById(tokenExist.user)
      user.password = await hashPassword(req.body.password)

      await Promise.allSettled([user.save(), tokenExist.deleteOne()])

      res.send('Password was updated sucessfully!')

    } catch (error) {
      res.status(500).json({ error: 'There was an error' })
    }
  }

  static user = async (req: Request, res: Response) => {
    return res.json(req.user)
  }

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body

    const userExists = await User.findOne({ email })

    if (userExists && userExists.id.toString() !== req.user.id.toString()) {
      const error = new Error('Email is already registered')
      return res.status(409).json({ error: error.message })
    }

    req.user.name = name
    req.user.email = email

    try {
      await req.user.save()
      res.send('Profile updated sucessfully')
    } catch (error) {
      res.status(500).send('There was an error')

    }
  }

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body

    const user = await User.findById(req.user.id)
    const isPasswordCorrect = await checkPassword(current_password, user.password)

    if (!isPasswordCorrect) {
      const error = new Error('Current Password is incorrect')
      return res.status(401).json({ error: error.message })
    }

    try {
      user.password = await hashPassword(password)
      await user.save()
      res.send('Password sucessfully modified')
    } catch (error) {
      res.status(500).send('There was an error')
    }
  }
}