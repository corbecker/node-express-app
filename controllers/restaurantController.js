const mongoose = require('mongoose');
const Restaurant = mongoose.model('Restaurant');

exports.homePage = (req, res) => {
  res.render('index');
}

exports.addRestaurant = (req, res) => {
  res.render('editRestaurant', { title: 'Add Restaurant'});
}

exports.createRestaurant = async (req, res) => {
  const restaurant = await (new Restaurant(req.body)).save();
  req.flash('success', `Successfully Created ${restaurant.name}. Care to leave a review?`)
  res.redirect(`/store/${restaurant.slug}`);
}

exports.getRestaurants = async (req, res) => {
  // first query the DB for all stores
  const restaurants = await Restaurant.find();
  res.render('restaurants', { title: 'Restaurants', restaurants });
}