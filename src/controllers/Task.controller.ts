import type {Request, Response} from 'express'
import Project from '../models/Project'
import Task from '../models/Task'

export class TaskController {
  static createTask = async (req:Request, res: Response) => {
    
    try {
      const task = new Task(req.body)
      task.project = req.project.id
      req.project.tasks.push(task.id)
    
      await Promise.allSettled([
        task.save(),
        req.project.save()
      ])

      res.send('Task created successfully!')
      
    } catch (error) {
      res.status(500).json({error: 'Server Error'})
    }
  }

  static getProjectTasks = async (req:Request, res: Response) => {
    try {
      const tasks = await Task.find({project: req.project.id}).populate('project')
      res.json(tasks)
    } catch (error) {
      res.status(500).json({error: 'Server Error'})
    }
  }

  static getTaskById = async (req:Request, res: Response) => {
    try {
      const { taskId } = req.params
      const task = await Task.findById(taskId)

      if(!task) {
        const error = new Error('The Task doesn\'t exist' )
        return res.status(404).json({
          error: error.message
        })
      }

      if(task.project.toString() !== req.project.id) {
        const error = new Error('The Task doesn\'t exist in the Project' )
        return res.status(400).json({
          error: error.message
        })
      }

      res.json(task)
    } catch (error) {
      res.status(500).json({error: 'Server Error'})
    }
  }
  
  static updateTaskById = async (req:Request, res: Response) => {
    try {
      const { taskId } = req.params
      const task = await Task.findById(taskId)

      if(!task) {
        const error = new Error('The Task doesn\'t exist' )
        return res.status(404).json({
          error: error.message
        })
      }

      if(task.project.toString() !== req.project.id) {
        const error = new Error('The Task doesn\'t exist in the Project' )
        return res.status(400).json({
          error: error.message
        })
      }

      task.name = req.body.name
      task.description = req.body.description
      await task.save()

      res.send('The Task has updated sucessfully!')

    } catch (error) {
      res.status(500).json({error: 'Server Error'})
    }
  }

  static deleteTaskById = async (req:Request, res: Response) => {
    try {
      const { taskId } = req.params
      const task = await Task.findById(taskId)

      if(!task) {
        const error = new Error('The Task doesn\'t exist' )
        return res.status(404).json({
          error: error.message
        })
      }


      req.project.tasks = req.project.tasks.filter(task => task._id.toString() !== taskId)

      await Promise.allSettled([task.deleteOne(), req.project.save()])

      res.send('The Task has deleted sucessfully!')

    } catch (error) {
      res.status(500).json({error: 'Server Error'})
    }
  }

  static updateTaskStatus = async (req:Request, res: Response) => {
    try {
      const { taskId } = req.params

      const task = await Task.findById(taskId)

      if(!task) {
        const error = new Error('The Task doesn\'t exist' )
        return res.status(404).json({
          error: error.message
        })
      }

      const { status } = req.body
      task.status = status

      await task.save()
      res.send('The Task was succesfully updated!')

    } catch (error) {
      res.status(500).json({error: 'Server Error'})
    }
  }
}