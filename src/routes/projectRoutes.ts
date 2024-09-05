import { Router } from 'express'
import { ProjectController } from '../controllers/Project.controller'

const router = Router()

router.post('/', ProjectController.createProject)
router.get('/', ProjectController.getAllProjects)

export default router