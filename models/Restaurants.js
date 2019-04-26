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
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an author.'
    }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

restaurantsSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'restaurant'
});

// pre save hook to create a slug before saving a new restaurant
restaurantsSchema.pre('save', async function(next) {
    if (!this.isModified('name')) {
        next(); // skip 
        return;
    }
    this.slug = slug(this.name);
    // find other restaurants with same name
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const restaurantsWithSlug = await this.constructor.find({ slug: slugRegEx }); // this.constructor will equal the schema
    if (restaurantsWithSlug.length) {
        this.slug = `${this.slug}-${restaurantsWithSlug.length + 1}`;
    }
    next();
    // TODO unique slugs
});

// Defining Indexes for searching 
restaurantsSchema.index({
    name: 'text',
    description: 'text'
});

restaurantsSchema.index({
    location: '2dsphere'
});

restaurantsSchema.statics.getTagsList = function() {
    return this.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
}

restaurantsSchema.set('toObject', { virtuals: true })
restaurantsSchema.set('toJSON', { virtuals: true })

function autopopulate(next) {
    this.populate('reviews');
    next();
}

restaurantsSchema.statics.getTopRestaurants = function() {
  // aggregate returns a promise
  return this.aggregate([
    // lookup restaurants and poulate reviews
    { 
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'restaurant',
        as: 'reviews'
      }
    }
    //filter for only items that have 2 or more reviews

    // add the average reviews field

    //sort it by our new field highest reviews first 

    //limit to at most 10
  ]);
};

restaurantsSchema.pre('find', autopopulate);
restaurantsSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Restaurant', restaurantsSchema);