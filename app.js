// app.js
const express = require('express')
const exphbs = require('express-handlebars')
const db = require('./models')  // 引入資料庫
const app = express()
const port = 3000

// set view engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.listen(port, () => {
  console.log(`This app is listening on port ${port}`)
})

// 引入 routes 並將 app 傳進去，讓 routes 可以用 app 這個物件來指定路由
require('./routes')(app)