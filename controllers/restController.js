// controllers/restControllers.js
const db = require('../models')
const Category = db.Category
const Restaurant = db.Restaurant


let restController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll({ include: Category }).then(restaurants => {
      const data = restaurants.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name
      }))
      return res.render('restaurants', { restaurants: data })
    })
  },
}

module.exports = restController