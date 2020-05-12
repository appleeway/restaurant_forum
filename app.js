// app.js
const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const db = require('./models')  // 引入資料庫
const app = express()
const port = process.env.PORT || 3000
if (process.env.NODE.ENV !== 'production') {
  require('dotenv').config()
}
const passport = require('./config/passport')

app.use('/upload', express.static(__dirname + '/upload'))

// set view engine
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
}))
app.set('view engine', 'handlebars')

// set body-parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// set method-override
app.use(methodOverride('_method'))

// set session connect-flash
app.use(session({ secret: 'hotcat', resave: false, saveUninitialized: false }))
// set passport
app.use(passport.initialize())
app.use(passport.session())
// set connect-flash
app.use(flash())

// 把 req.flash 放到 res.locals 裡面
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user
  next()
})

app.listen(port, () => {
  db.sequelize.sync() // 跟資料庫同步
  console.log(`This app is listening on port ${port}`)
})

// 引入 routes 並將 app 與 passport 傳進去，讓 routes 可以用 app 這個物件來指定路由
require('./routes')(app)