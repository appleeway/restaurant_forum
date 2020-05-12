// services/userService.js
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

// JWT
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const userController = {
  signUp: (req, res, cb) => {
    if (req.body.passwordCheck !== req.body.password) {
      cb({ status: 'error', message: '兩次密碼輸入不同！' })
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          cb({ status: 'error', message: '信箱重複！' })
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
          }).then(user => {
            cb({ status: 'success', message: '成功註冊帳號' })
          })
        }
      })
    }
  },
  signIn: (req, res, cb) => {
    // 檢查必要資料
    if (!req.body.email || !req.body.password) {
      cb({ status: 'error', message: "required fields didn't exist" })
    }
    // 檢查 user 是否存在及密碼是否正確
    let username = req.body.email
    let password = req.body.password

    User.findOne({ where: { email: username } }).then(user => {
      if (!user) { cb({ status: 'error', message: 'no such user found' }) }
      if (!bcrypt.compareSync(password, user.password)) {
        cb({ status: 'error', message: "password didn't match" })
      }
      // 簽發 token
      let payload = { id: user.id }
      let token = jwt.sign(payload, process.env.JWT_SECRET)
      cb({
        status: 'success',
        message: 'ok',
        user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin },
        token,
      })
    })
  },

  getUser: (req, res, cb) => {
    let commentNumber, favoritedRestNumber, followerNumber, followingNumber = ''
    let isOwner = req.user.id === Number(req.params.id)
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [Restaurant] },
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    })
      .then((theUser) => {
        //---------------------排除重複評論的餐廳----------------
        function dedup(arr) {
          let hashTable = {}
          return arr.filter((el) => {
            let key = JSON.stringify(el)
            let match = Boolean(hashTable[key])
            return (match ? false : hashTable[key] = true)
          })
        }
        restaurantIdArray = theUser.Comments.map(item => ({
          id: item.dataValues.Restaurant.dataValues.id,
          image: item.dataValues.Restaurant.dataValues.image
        }))
        reviewedRestaurants = dedup(restaurantIdArray)
        //-----------------------------------------------------
        commentNumber = reviewedRestaurants.length
        favoritedRestNumber = theUser.FavoritedRestaurants.length
        followerNumber = theUser.Followers.length
        followingNumber = theUser.Followings.length
        isFollowed = req.user.Followings.some(d => d.id === theUser.id)
        //=====需要想辦法重構，太多太亂不好維護======
        Comment.findOne({
          where: { UserId: req.params.id },
          order: [['createdAt', 'DESC']]
        }).then(comment => {
          cb({
            theUser: theUser,
            comment: comment,
            reviewedRestaurants,
            isOwner,
            isFollowed,
            commentNumber,
            favoritedRestNumber,
            followerNumber,
            followingNumber
          })
        })
      })
  },
  putUser: (req, res, cb) => {
    if (!req.body.name) {
      cb({ status: 'error', message: "name didn't exist" })
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
              cb({ status: 'success', message: 'User data was successfully updated' })
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
            cb({ status: 'success', message: 'User was successfully updated' })
          })
        })
    }
  },
  addFavorite: (req, res, cb) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      cb({ status: 'success', message: 'add success' })
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
          cb({ status: 'success', message: 'remove success' })
        })
    })
  },
  addLike: (req, res, cb) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      cb({ status: 'success', message: 'add success' })
    })
  },
  removeLike: (req, res, cb) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => { like.destroy() })
      .then(done => { cb({ status: 'success', message: 'remove success' }) })
  },
  addFollowing: (req, res, cb) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    }).then((followship) => {
      cb({ status: 'success', message: 'add success' })
    })
  },
  removeFollowing: (req, res, cb) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    }).then(followship => {
      followship.destroy()
        .then(followship => {
          cb({ status: 'success', message: 'remove success' })
        })
    })
  },
  getTopUser: (req, res, cb) => {
    // 撈出所有 User 與 followers 的資料
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.some(d => d.id === user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      cb({ users })
    })
  },
}

module.exports = userController