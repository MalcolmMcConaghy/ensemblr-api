const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

const db = require('./queries')

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', db.getUsers)

app.listen(port, () => {
    console.log(`App running on localhost:${port}`)
})