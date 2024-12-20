import { Router } from 'express'
import { body, param } from 'express-validator'
import { ProjectController } from '../controllers/Project.controller'
import { handleInputErrors } from '../middleware/validation'
import { TaskController } from '../controllers/Task.controller'
import { projectExist } from '../middleware/project'
import { hasAuthorization, taskBelongsToProject, taskExist } from '../middleware/task'
import { authenticate } from '../middleware/auth'
import { TeamMemberController } from '../controllers/Team.controller'
import { NoteController } from '../controllers/Note.controller'

const router = Router()

router.use(authenticate)

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

/* Routes for Tasks */

// Este endpoint valida projectId en todos los endpoints donde venga
router.param('projectId', projectExist)

router.put('/:projectId',
  param('projectId').isMongoId().withMessage('Invalid ID'),
  body('projectName').trim().notEmpty().withMessage('Project\'s name is required'),
  body('clientName').trim().notEmpty().withMessage('Client\'s name is required'),
  body('description').trim().notEmpty().withMessage('Description project is required'),
  handleInputErrors,
  hasAuthorization,
  ProjectController.updateProject
)

router.delete('/:projectId',
  param('projectId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProjectById
)



router.post('/:projectId/tasks',
  hasAuthorization,
  body('name').trim().notEmpty().withMessage('Task\'s name is required'),
  body('description').trim().notEmpty().withMessage('Task\'s description is required'),
  handleInputErrors,
  TaskController.createTask
)

router.get('/:projectId/tasks',
  TaskController.getProjectTasks
)

router.param('taskId', taskExist)
router.param('taskId', taskBelongsToProject)

router.get('/:projectId/tasks/:taskId',
  param('taskId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
  hasAuthorization,
  param('taskId').isMongoId().withMessage('Invalid ID'),
  body('name').trim().notEmpty().withMessage('Task\'s name is required'),
  body('description').trim().notEmpty().withMessage('Task\'s description is required'),
  handleInputErrors,
  TaskController.updateTaskById
)

router.delete('/:projectId/tasks/:taskId',
  hasAuthorization,
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


/** Routes for teams */

router.post('/:projectId/team/find',
  body('email').isEmail().toLowerCase().withMessage('Invalid E-mail'),
  handleInputErrors,
  TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team',
  TeamMemberController.getProjectTeam
)

router.post('/:projectId/team',
  body('id').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
  param('userId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  TeamMemberController.removeMemberById
)

/** Routes for Notes */
router.post('/:projectId/tasks/:taskId/notes',
  body('content').notEmpty().withMessage('Contents Note is required'),
  handleInputErrors,
  NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
  NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
  param('noteId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  NoteController.deleteNote
)

export default router