import mongoose from 'mongoose'

const DB_URL = process.env.DB_URL
const DB_NAME = process.env.DB_NAME
export const connectDB = async () => {
    try {
      const db = await mongoose.connect(DB_URL, {
            dbName: DB_NAME
        })
        console.log('Connected to MongoDB successfully')
        return db
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}
