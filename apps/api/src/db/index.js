import mongoose from 'mongoose'

export const connectDB = async () => {
  const DB_URL = process.env.DB_URL
  const DB_NAME = process.env.DB_NAME

  if (!DB_URL) {
    console.error('DB_URL is missing. Check apps/api/.env')
    process.exit(1)
  }

  try {
    const db = await mongoose.connect(DB_URL, {
      dbName: DB_NAME,
    })
    console.log('Connected to MongoDB successfully')
    return db
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
