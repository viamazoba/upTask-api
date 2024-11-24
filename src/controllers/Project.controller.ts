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
      const projects = await Project.find({
        $or: [
          { manager: { $in: req.user.id } },
          { team: { $in: req.user.id } }
        ]
      })
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

      if (project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
        const error = new Error('Permission denied')
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

    try {

      req.project.clientName = req.body.clientName
      req.project.projectName = req.body.projectName
      req.project.description = req.body.description


      await req.project.save()
      res.send('Project updated succesfully!')

    } catch (error) {
      console.log(error)
    }
  }

  static deleteProjectById = async (req: Request, res: Response) => {
    try {

      await req.project.deleteOne()

      res.send('Project deleted sucessfully!')

    } catch (error) {
      console.log(error)
    }
  }
}