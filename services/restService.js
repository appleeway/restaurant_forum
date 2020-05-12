// services/restService.js
const db = require('../models')
const Category = db.Category
const Comment = db.Comment
const User = db.User
const Restaurant = db.Restaurant
const pageLimit = 10

let restController = {
  getRestaurants: (req, res, cb) => {
    let offset = 0
    let whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['CategoryId'] = categoryId
    }
    Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset: offset, limit: pageLimit }).then(result => {
      // data for pagination
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(result.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1
      // clean up restaurant data
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        isFavorited: req.user.FavoritedRestaurants.some(d => d.id === r.id),
        isLiked: req.user.LikedRestaurants.some(d => d.id === r.id),
        categoryName: r.Category.name
      }))
      Category.findAll().then(categories => {
        cb({
          restaurants: data,
          categories,
          categoryId,
          page,
          totalPage,
          prev,
          next
        })
      })
    })
  },
  getRestaurant: (req, res, cb) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.some(d => d.id === req.user.id)
      const isLiked = restaurant.LikedUsers.map(d => d.id === req.user.id)
      restaurant.increment('viewCounts', { by: 1 }).then(done => {
        cb({
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked
        })
      })
    })
  },
  getFeeds: (req, res, cb) => {
    return Restaurant.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [Category]
    }).then(restaurant => {
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      }).then(comments => {
        cb({ restaurant, comments })
      })
    })
  },
  getDashboard: (req, res, cb) => {
    Restaurant.findOne({
      where: { id: req.params.id },
      include: [
        Category,
        { model: Comment },
        { model: User, as: "FavoritedUsers" }
      ]
    }).then(restaurant => {
      cb({
        restaurant: restaurant.toJSON(),
        commentNumber: restaurant.Comments.length,
        favoritedNumber: restaurant.FavoritedUsers.length
      })
    })
  },
  getTopTen: (req, res, cb) => {
    Restaurant.findAll({
      include: [
        { model: User, as: 'FavoritedUsers' }
      ]
    }).then(restaurants => {
      restaurants = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        description: restaurant.description.substring(0, 50),
        FavoritedCount: restaurant.FavoritedUsers.length,
        isFavorited: req.user.FavoritedRestaurants.some((d => d.id === restaurant.id))
      }))
      restaurants = restaurants.sort((a, b) => b.FavoritedCount - a.FavoritedCount).slice(0, 10)
      cb({ restaurants })
    })
  }
}

module.exports = restController