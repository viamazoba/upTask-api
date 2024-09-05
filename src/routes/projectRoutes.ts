import { Router } from 'express'
import { body } from 'express-validator'
import { ProjectController } from '../controllers/Project.controller'
import { handleInputErrors } from '../middleware/validation'

const router = Router()

router.post('/',
  body('projectName').trim().notEmpty().withMessage('Project\'s name is required'),
  body('clientName').trim().notEmpty().withMessage('Client\'s name is required'),
  body('description').trim().notEmpty().withMessage('Description project is required'),
  handleInputErrors,
  ProjectController.createProject
)
router.get('/', ProjectController.getAllProjects)

export default router