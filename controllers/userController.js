// controllers/userControllers.js
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

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
        isFollowed = req.user.Followings.map(d => d.id).includes(theUser.id)
        //=====需要想辦法重構，太多太亂不好維護======
        Comment.findOne({
          where: { UserId: req.params.id },
          order: [['createdAt', 'DESC']]
        }).then(comment => {
          if (!comment) {
            res.render('profile', {
              theUser: theUser.toJSON(),
              reviewedRestaurants: reviewedRestaurants,
              isOwner: isOwner,
              isFollowed: isFollowed,
              commentNumber: commentNumber,
              favoritedRestNumber: favoritedRestNumber,
              followerNumber: followerNumber,
              followingNumber: followingNumber
            })
          } else {
            res.render('profile', {
              theUser: theUser.toJSON(),
              reviewedRestaurants: reviewedRestaurants,
              isOwner: isOwner,
              isFollowed: isFollowed,
              comment: comment.toJSON(),
              commentNumber: commentNumber,
              favoritedRestNumber: favoritedRestNumber,
              followerNumber: followerNumber,
              followingNumber: followingNumber
            })
          }

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
  },
  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      res.redirect('back')
    })
  },
  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(like => {
      like.destroy()
        .then(done => {
          return res.redirect('back')
        })
    })
  },
  getTopUser: (req, res) => {
    // 撈出所有 User 與 followers 的資料
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  },
  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    }).then((followship) => {
      return res.redirect('back')
    })
  },
  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    }).then(followship => {
      followship.destroy()
        .then(followship => {
          return res.redirect('back')
        })
    })
  }
}

module.exports = userController