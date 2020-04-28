// app.js
const express = require('express')
const exphbs = require('express-handlebars')

const app = express()
const port = 3000

// set view engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.listen(port, () => {
  console.log(`This app is listening on port ${port}`)
})