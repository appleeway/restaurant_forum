// controllers/categoryController.js
const db = require('../models')
const Category = db.Category

const categoryController = {
  getCategories: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then((categories) => {
      if (req.params.id) {
        Category.findByPk(req.params.id).then((category) => {
          return res.render('admin/categories', { categories: categories, category: category.get() })
        })
      } else {
        return res.render('admin/categories', { categories: categories })
      }

    })
  },

  postCategory: (req, res) => {
    return Category.create({
      name: req.body.name
    }).then((category) => {
      return res.redirect('/admin/categories')
    })
  }
}

module.exports = categoryController