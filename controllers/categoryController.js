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
      req.flash('success_messages', 'category was successfully created')
      return res.redirect('/admin/categories')
    })
  },
  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    return Category.findByPk(req.params.id).then((category) => {
      category.update({
        name: req.body.name
      }).then((category) => {
        req.flash('success_messages', 'category was successfully update')
        return res.redirect('/admin/categories')
      })
    })
  },

  deleteCategory: (req, res) => {
    return Category.findByPk(req.params.id).then((category) => {
      category.destroy()
        .then((category) => {
          req.flash('success_messages', 'category was successfully deleted')
          res.redirect('/admin/categories')
        })
    })
  }

}

module.exports = categoryController