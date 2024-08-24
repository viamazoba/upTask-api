import mongoose from 'mongoose'
import colors from 'colors'
import { exit } from 'node:process'

export const connetDB = async() => {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URL)
    const url = `${connection.connection.host}:${connection.connection.port}`
    console.log(colors.bgMagenta.bold(`MongoDB connected to: ${url}`))
  } catch (error) {
    console.log(colors.bgRed('Error in connection to MongoDB'))
    exit(1)
  }
}