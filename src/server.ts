import express from 'express'
import dotenv from 'dotenv'
import { connetDB } from './config/db'
import projectRoutes from './routes/projectRoutes'

dotenv.config()
connetDB()
const app = express()
app.use(express.json())

//Routes
app.use('/api/projects', projectRoutes)

export default app