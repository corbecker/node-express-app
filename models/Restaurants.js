const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // use built in ES6 Promise
const slug = require('slugs');

// MongoDB using strict schema so any data passed that isnt expected will be thrown away.
const restaurantsSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    requires: 'Please Enter a Restaurant Name.'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String]
});

// pre save hook to create a slug before saving a new restaurant
restaurantsSchema.pre('save', function(next) {
  if(!this.isModified('name')){
    next(); // skip 
    return;
  }
  this.slug = slug(this.name);
  next();
  // TODO unique slugs
});

module.exports = mongoose.model('Restaurant', restaurantsSchema);