import express from 'express'
import dotenv from 'dotenv'
import { connetDB } from './config/db'

dotenv.config()
connetDB()
const app = express()

export default app