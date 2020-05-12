// services/adminService.js
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User

const adminService = {
  getRestaurants: (req, res, cb) => {
    return Restaurant.findAll({ include: [Category] }).then(restaurants => {
      cb({ restaurants: restaurants })
    })
  },
  createRestaurant: (req, res, cb) => {
    Category.findAll().then(categories => {
      return cb({ categories: categories })
    })
  },
  getRestaurant: (req, res, cb) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] }).then(restaurant => {
      cb({ restaurant: restaurant })
    })
  },
  editRestaurant: (req, res, cb) => {
    Category.findAll().then(categories => {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        cb({ categories: categories, restaurant: restaurant })
      })
    })
  },
  deleteRestaurant: (req, res, cb) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            cb({ status: 'success', message: '' })
          })
      })
  },
  postRestaurant: (req, res, cb) => {
    if (!req.body.name) {
      return cb({ status: 'error', message: "name didn't exist" })
    }
    const { file } = req // equal to 'const file = req.file'
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        })
          .then((restaurant) => {
            cb({ status: 'success', message: 'restaurant was successfully created' })
          })
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      })
        .then((restaurant) => {
          cb({ status: 'success', message: 'restaurant was successfully created' })
        })
    }
  },
  putRestaurant: (req, res, cb) => {
    if (!req.body.name) {
      cb({ status: 'error', message: "name didn't exist" })

    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.categoryId
            }).then((restaurant) => {
              cb({ status: 'success', message: 'restaurant was successfully updated' })
            })
          })
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image,
            CategoryId: req.body.categoryId
          }).then((restaurant) => {
            cb({ status: 'success', message: 'restaurant was successfully updated}' })
          })
        })
    }
  },

  // User admin controller
  getUsers: (req, res, cb) => {
    return User.findAll().then(users => {
      cb({ users: users })
    })
  },
  putUsers: (req, res, cb) => {
    return User.findByPk(req.params.id)
      .then((user) => {
        user.update({
          isAdmin: user.isAdmin ? 0 : 1
        }).then((user) => {
          cb({ status: 'success', message: 'user auth was successfully update' })
        })
      })
  }
}

module.exports = adminService