// services/commentService.js
const db = require('../models')
const Comment = db.Comment

const commentController = {
  postComment: (req, res, cb) => {
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: req.user.id
    })
      .then((comment) => {
        cb({ status: 'success', message: 'comment has been posted' })
      })
  },
  deleteComment: (req, res, cb) => {
    return Comment.findByPk(req.params.id)
      .then((comment) => {
        comment.destroy()
          .then((comment) => {
            cb({ status: 'success', message: 'comment has been deleted' })
          })
      })
  }

}
module.exports = commentController