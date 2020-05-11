// services/adminService.js
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminService = {
  getRestaurants: (req, res, cb) => {
    return Restaurant.findAll({ include: [Category] }).then(restaurants => {
      cb({ restaurants: restaurants })
    })
  },
  getRestaurant: (req, res, cb) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] }).then(restaurant => {
      cb({ restaurant: restaurant })
    })
  },
}
module.exports = adminService