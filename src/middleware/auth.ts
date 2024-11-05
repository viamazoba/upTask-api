import { Request, Response, NextFunction } from "express"

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization
  if (!bearer) {
    const error = new Error('Resource denied')
    return res.status(401).json({ error: error.message })
  }

  const token = bearer.split(' ')[1]

  next()
}