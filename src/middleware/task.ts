import type {Request, Response, NextFunction} from 'express'
import Task, { ITask } from '../models/Task'

// Así añades propiedades al Request que antes no existian, el type no permite hacer esto
declare global {
  namespace Express {
    interface Request {
      task: ITask
    }
  }
}

export async function taskExist(req:Request, res:Response, next: NextFunction) {
  try {
    const { taskId } = req.params
      const task = await Task.findById(taskId)

      if(!task) {
        const error = new Error('The Task doesn\'t exist' )
        return res.status(404).json({
          error: error.message
        })
      }

      req.task = task

      next()

  } catch (error) {
    res.status(500).json({
      error: ''
    })
  }
}