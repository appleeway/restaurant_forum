// controllers/userControllers.js
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite

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
    let commentNumber = ''
    let isOwner = req.user.id === Number(req.params.id) ? 'true' : ''
    return User.findByPk(req.params.id, {
      include: [{ model: Comment, include: [Restaurant] }]
    })
      .then((theUser) => {
        commentNumber = theUser.Comments.length
        Comment.findOne({
          where: { UserId: req.params.id },
          order: [['createdAt', 'DESC']]
        }).then(comment => {
          res.render('profile', {
            theUser: theUser.toJSON(),
            isOwner: isOwner,
            commentNumber: commentNumber,
            comment: comment.toJSON()
          })
        })
      })
  },

  editUser: (req, res) => {
    if (req.user.id === Number(req.params.id)) {
      res.render('edit')
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
  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      return res.redirect('back')
    })
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(favorite => {
      favorite.destroy()
        .then(restaurant => {
          return res.redirect('back')
        })
    })
  }
}

module.exports = userController