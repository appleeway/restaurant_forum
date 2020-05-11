// routes/apis.js
const express = require('express')
const router = express.Router()
const adminController = require('../controllers/api/adminController')

router.get('/admin/restaurants', adminController.getRestaurants)

router.get('/admin/restaurant/:id', adminController.getRestaurant)

module.exports = router
