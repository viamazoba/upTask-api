import type {Request, Response, NextFunction} from 'express'
import Project, { IProject } from '../models/Project'

// Así añades propiedades al Request que antes no existian, el type no permite hacer esto
declare global {
  namespace Express {
    interface Request {
      project: IProject
    }
  }
}

export async function validateProjectExist(req:Request, res:Response, next: NextFunction) {
  try {
    const { projectId } = req.params
      const project = await Project.findById(projectId)

      if(!project) {
        const error = new Error('The Project doesn\'t exist' )
        return res.status(404).json({
          error: error.message
        })
      }

      req.project = project

      next()

  } catch (error) {
    res.status(500).json({
      error: ''
    })
  }
}