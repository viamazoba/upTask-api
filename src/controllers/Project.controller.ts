import type { Request, Response } from "express"
import Project from "../models/Project"


export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body)

    // Asignar manager
    project.manager = req.user.id

    try {
      await project.save()
      res.send('Project Created Sucessfully ...')
    } catch (error) {
      console.log(error)
    }
  }

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({})
      res.json(projects)

    } catch (error) {
      console.log(error)
    }

  }

  static getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
      const project = await Project.findById(id).populate('tasks')

      if (!project) {
        const error = new Error('The Project doesn\'t exist')
        return res.status(404).json({
          error: error.message
        })
      }
      res.json(project)

    } catch (error) {
      console.log(error)
    }
  }

  static updateProject = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
      const project = await Project.findById(id)

      if (!project) {
        const error = new Error('The Project doesn\'t exist')
        return res.status(404).json({
          error: error.message
        })
      }

      project.clientName = req.body.clientName
      project.projectName = req.body.projectName
      project.description = req.body.description


      await project.save()
      res.send('Project updated succesfully!')

    } catch (error) {
      console.log(error)
    }
  }

  static deleteProjectById = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
      const project = await Project.findById(id)


      if (!project) {
        const error = new Error('The Project doesn\'t exist')
        return res.status(404).json({
          error: error.message
        })
      }

      await project.deleteOne()

      res.send('Project deleted sucessfully!')

    } catch (error) {
      console.log(error)
    }
  }
}