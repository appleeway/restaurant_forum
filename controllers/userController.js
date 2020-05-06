// controllers/userControllers.js
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    if (req.user.id === Number(req.params.id)) {
      return User.findByPk(req.user.id)
        .then((user) => {
          res.render('profile', { user: user.toJSON(), isOwner: 'true' })
        })
    } else {
      User.findByPk(req.user.id).then(user => {
        User.findByPk(req.params.id)
          .then((otherUser) => {   //為了使 main.handlebars 裡的 navbar 維持在原user，改了這個更動但覺得會有更好的寫法
            res.render('profile', { user: user.toJSON(), otherUser: otherUser.toJSON() })
          })
      })
    }
  },

  editUser: (req, res) => {
    if (req.user.id === Number(req.params.id)) {
      return User.findByPk(req.user.id)
        .then(user => {
          res.render('edit', { user: user.toJSON() })
        })
    } else {
      res.redirect('back')
    }
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.user.id)
          .then((user) => {
            user.update({
              ...user,
              name: req.body.name,
              image: file ? img.data.link : user.image
            }).then((user) => {
              req.flash('success_messages', 'User data was successfully updated')
              res.redirect(`/users/${req.user.id}`)
            })
          })
      })
    } else {
      return User.findByPk(req.user.id)
        .then((user) => {
          user.update({
            ...user,
            name: req.body.name,
            image: user.image
          }).then(user => {
            req.flash('success_messages', 'User was successfully updated')
            res.redirect(`/users/${req.user.id}`)
          })
        })
    }
  }
}

module.exports = userController