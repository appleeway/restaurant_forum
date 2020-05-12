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
  postCategory: (req, res, cb) => {
    if (!req.body.name) {
      cb({ status: 'error', message: "name didn't exist" })
    } else {
      return Category.create({
        name: req.body.name
      }).then((category) => {
        cb({ status: 'success', message: 'category was successfully created' })
      })
    }
  },
  putCategory: (req, res, cb) => {
    if (!req.body.name) {
      cb({ status: 'error', message: "name didn't exist" })
    }
    return Category.findByPk(req.params.id).then((category) => {
      category.update({
        name: req.body.name
      }).then((category) => {
        cb({ status: 'success', massage: 'category was successfully update' })
      })
    })
  },
  deleteCategory: (req, res, cb) => {
    return Category.findByPk(req.params.id).then((category) => {
      category.destroy()
        .then((category) => {
          cb({ status: 'success', message: 'category was successfully deleted' })
        })
    })
  }

}
module.exports = categoryController