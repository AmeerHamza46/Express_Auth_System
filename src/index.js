import 'dotenv/config'
import { connectDB } from './db/index.js'
import { app } from './app.js'

const port = process.env.PORT

app.listen(port, async () => {
  try {
    await connectDB()
    console.log(`Example app listening on port ${port}`)
    app.get('/', (req, res) => {
      res.send('Hello World')
    })
  } catch (error) {
    console.error(error)
  }
})
