// routes/apis.js
const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
// 引入 multer 並設定上傳資料夾
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const adminController = require('../controllers/api/adminController')
const categoryController = require('../controllers/api/categoryController')
const userController = require('../controllers/api/userController')

const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) { return next() }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}
// top users
router.get('/users/top', authenticated, userController.getTopUser)
//
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)
// favorite
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
// like
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)
// following
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)
// admin/restaurants
router.get('/admin/restaurants', authenticated, authenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/create', authenticated, authenticatedAdmin, adminController.createRestaurant)
router.get('/admin/restaurant/:id', authenticated, authenticatedAdmin, adminController.getRestaurant)
router.get('/admin/restaurants/:id/edit', authenticated, authenticatedAdmin, adminController.editRestaurant)
router.delete('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.deleteRestaurant)
router.post('/admin/restaurants', authenticated, authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.put('/admin/restaurants/:id', authenticated, authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
// admin/users
router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)
router.put('/admin/users/:id', authenticated, authenticatedAdmin, adminController.putUsers)
// admin/categories
router.get('/admin/categories', authenticated, authenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticated, authenticatedAdmin, categoryController.postCategory)
router.put('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.deleteCategory)
// JWT sign up/in
router.post('/signup', userController.signUp)
router.post('/signin', userController.signIn)


module.exports = router
