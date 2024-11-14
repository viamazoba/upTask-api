import type { Request, Response } from 'express'
import Project from '../models/Project'
import Task from '../models/Task'

export class TaskController {
  static createTask = async (req: Request, res: Response) => {

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
      res.status(500).json({ error: 'Server Error' })
    }
  }

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project.id }).populate('project')
      res.json(tasks)
    } catch (error) {
      res.status(500).json({ error: 'Server Error' })
    }
  }

  static getTaskById = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task.id).populate({
        path: 'completedBy.user',
        select: 'id name email'
      })
      res.json(task)
    } catch (error) {
      res.status(500).json({ error: 'Server Error' })
    }
  }

  static updateTaskById = async (req: Request, res: Response) => {
    try {

      if (req.task.project.toString() !== req.project.id) {
        const error = new Error('The Task doesn\'t exist in the Project')
        return res.status(400).json({
          error: error.message
        })
      }

      req.task.name = req.body.name
      req.task.description = req.body.description
      await req.task.save()

      res.send('The Task has updated sucessfully!')

    } catch (error) {
      res.status(500).json({ error: 'Server Error' })
    }
  }

  static deleteTaskById = async (req: Request, res: Response) => {
    try {

      req.project.tasks = req.project.tasks.filter(task => task._id.toString() !== req.task.id.toString())

      await Promise.allSettled([req.task.deleteOne(), req.project.save()])

      res.send('The Task has deleted sucessfully!')

    } catch (error) {
      res.status(500).json({ error: 'Server Error' })
    }
  }

  static updateTaskStatus = async (req: Request, res: Response) => {
    try {

      const { status } = req.body
      req.task.status = status

      const data = {
        user: req.user.id,
        status
      }

      req.task.completedBy.push(data)

      await req.task.save()
      res.send('The Task was succesfully updated!')

    } catch (error) {
      res.status(500).json({ error: 'Server Error' })
    }
  }
}