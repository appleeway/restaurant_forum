// routes/apis.js
const express = require('express')
const router = express.Router()
// 引入 multer 並設定上傳資料夾
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const adminController = require('../controllers/api/adminController')
const categoryController = require('../controllers/api/categoryController')

router.get('/admin/restaurants', adminController.getRestaurants)

router.get('/admin/restaurant/:id', adminController.getRestaurant)

router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)

router.post('/admin/restaurants', upload.single('image'), adminController.postRestaurant)

router.put('/admin/restaurants/:id', upload.single('image'), adminController.putRestaurant)

router.get('/admin/categories', categoryController.getCategories)

router.post('/admin/categories', categoryController.postCategory)

router.put('/admin/categories/:id', categoryController.putCategory)

router.delete('/admin/categories/:id', categoryController.deleteCategory)


module.exports = router
