import dotenv from 'dotenv'
import mongoose from "mongoose"

dotenv.config()

export const mongodb_connect = (mongo_url: string) => {
  // Connecting to the database
  mongoose
    .connect(mongo_url)
    .then(() => {
      console.log("Successfully connected to database")
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...")
      console.error(error)
      process.exit(1)
    })
}
