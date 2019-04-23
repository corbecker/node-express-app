const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author!'
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: 'You mustv supply a restaurant!'
  },
  text: {
    type: String,
    required: 'Review must have text.'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: 'Cannot leave 0 star review.'
  }

});

module.exports = mongoose.model('Review', reviewSchema);