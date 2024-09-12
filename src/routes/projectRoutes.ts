import { Router } from 'express'
import { body, param } from 'express-validator'
import { ProjectController } from '../controllers/Project.controller'
import { handleInputErrors } from '../middleware/validation'
import { TaskController } from '../controllers/Task.controller'
import { validateProjectExist } from '../middleware/project'

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

/* Routes for Tasks */

// Este endpoint valida projectId en todos los endpoints donde venga
router.param('projectId', validateProjectExist)

router.post('/:projectId/tasks',
  body('name').trim().notEmpty().withMessage('Task\'s name is required'),
  body('description').trim().notEmpty().withMessage('Task\'s description is required'),
  handleInputErrors,
  TaskController.createTask
)

router.get('/:projectId/tasks',
  TaskController.getProjectTasks
)

router.get('/:projectId/tasks/:taskId',
  param('taskId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors, 
  TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
  param('taskId').isMongoId().withMessage('Invalid ID'),
  body('name').trim().notEmpty().withMessage('Task\'s name is required'),
  body('description').trim().notEmpty().withMessage('Task\'s description is required'),
  handleInputErrors, 
  TaskController.updateTaskById
)

router.delete('/:projectId/tasks/:taskId',
  param('taskId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors, 
  TaskController.deleteTaskById
)

router.post('/:projectId/tasks/:taskId/status',
  param('taskId').isMongoId().withMessage('Invalid ID'),
  body('status').trim().notEmpty().withMessage('Status cannot have a empty value'),
  handleInputErrors,
  TaskController.updateTaskStatus
)

export default router