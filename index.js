import 'dotenv/config'
import express from 'express'
const app = express()
const port = process.env.PORT

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get("/about", (req, res)=>{
    res.send(`Your are on the page ${req.url}`)
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
