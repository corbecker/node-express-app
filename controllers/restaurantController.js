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

exports.editRestaurant = async (req, res) => {
  // Find restaurant by id
  const restaurant = await Restaurant.findOne({ _id: req.params.id } );
  res.render('editRestaurant', { title: `Edit ${restaurant.name}`, restaurant});
  // Confirm user owns restaurant
}

exports.updateRestaurant = async (req, res) => {
  console.log('yas')
  // Find the erstaurant & update
  const restaurant = await Restaurant.findOneAndUpdate({ _id: req.params.id }, req.body, { 
    new: true, 
    runValidators: true 
  } ).exec();
  // Redirect to restaurant & flash
  req.flash('success', `Successfully updated ${restaurant.name}.`);
  res.redirect(`/restaurants/${restaurant._id}/edit`);

}