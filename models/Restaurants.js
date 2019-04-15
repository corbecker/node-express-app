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
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply a coordinate.'
    }],
    address: {
      type: String,
      required: 'You must supply an address.'
    }
  },
  photo: String
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