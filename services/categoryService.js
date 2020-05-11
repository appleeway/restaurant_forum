// services/categoryService.js

const db = require('../models')
const Category = db.Category

const categoryController = {
  getCategories: (req, res, cb) => {
    Category.findAll().then((categories) => {
      if (req.params.id) {
        Category.findByPk(req.params.id).then((category) => {
          cb({ categories: categories, category: category })
        })
      } else {
        cb({ categories: categories })
      }
    })
  },

}
module.exports = categoryController