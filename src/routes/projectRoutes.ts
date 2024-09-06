import { Router } from 'express'
import { body, param } from 'express-validator'
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

router.get('/:id',
  param('id').isMongoId().withMessage('Invalid ID'),
  handleInputErrors, 
  ProjectController.getProjectById
)

router.put('/:id',
  param('id').isMongoId().withMessage('Invalid ID'),
  body('projectName').trim().notEmpty().withMessage('Project\'s name is required'),
  body('clientName').trim().notEmpty().withMessage('Client\'s name is required'),
  body('description').trim().notEmpty().withMessage('Description project is required'),
  handleInputErrors, 
  ProjectController.updateProject
)

router.delete('/:id',
  param('id').isMongoId().withMessage('Invalid ID'),
  handleInputErrors, 
  ProjectController.deleteProjectById
)


export default router