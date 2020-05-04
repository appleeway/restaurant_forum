// controllers/categoryController.js
const db = require('../models')
const Category = db.Category

const categoryController = {
  getCategories: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then((categories) => {
      return res.render('admin/categories', { categories: categories })
    })
  },

}

module.exports = categoryController