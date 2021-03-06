const mongoose = require('mongoose');
const Restaurant = mongoose.model('Restaurant');
const multer = require('multer'); // handles image uploading 
const jimp = require('jimp'); //resizes images
const uuid = require('uuid'); //uniqure identifiers for images
const User = mongoose.model('User');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter: function(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        } else {
            next({ message: 'File type not allowed.' }, false);
        }
    }
}

exports.resize = async(req, res, next) => {
    // check if no new file 
    if (!req.file) {
        next();
        return;
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    //resize the image
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    // keep going once photo is saved
    next();
}

exports.upload = multer(multerOptions).single('photo');

exports.homePage = (req, res) => {
    res.render('index');
}

exports.addRestaurant = (req, res) => {
    res.render('editRestaurant', { title: 'Add Restaurant' });
}

exports.createRestaurant = async(req, res) => {
    req.body.author = req.user._id;
    const restaurant = await (new Restaurant(req.body)).save();
    req.flash('success', `Successfully Created ${restaurant.name}. Care to leave a review?`)
    res.redirect(`/restaurant/${restaurant.slug}`);
}

exports.getRestaurants = async(req, res) => {
    const tag = req.params.tag;
    const user = req.user;
    const tagsPromise = Restaurant.getTagsList();
    const tagQuery = tag || { $exists: true }; // tag or any restaurant with a tag property which is all of them

    const page = req.params.page || 1; //page or 1 for homepage
    const limit = 6;
    const skip = (page * limit) - limit; // the amount of restaurants to skip to get to that page
    const restaurantsPromise = Restaurant
      .find({ tags: tagQuery })
      .skip(skip)
      .limit(limit)
      .sort({created: 'desc'})

    const countPromise = Restaurant.count();
    
    const [tags, restaurants, count] = await Promise.all([tagsPromise, restaurantsPromise, countPromise]); // multiple query promise

    const pages = Math.ceil(count / limit);

    if(!restaurants.length && skip){
      req.flash('info', "Page doesn't exist");
      res.redirect(`/restaurants/page/${pages}`);
      return;
    }

    res.render('restaurants', { title: 'Restaurants', restaurants, tags, tag, user, page, count, pages });

}

const confirmOwner = (restaurant, user) => {
  if(!restaurant.author.equals(user._id)){
    throw Error('You must be the owner of the restaurant to edit it.')
  }
}

exports.editRestaurant = async(req, res) => {
    // Find restaurant by id
    const restaurant = await Restaurant.findOne({ _id: req.params.id });
    confirmOwner(restaurant, req.user);
    res.render('editRestaurant', { title: `Edit ${restaurant.name}`, restaurant });
    // Confirm user owns restaurant
}

exports.updateRestaurant = async(req, res) => {
    req.body.location.type = 'Point';
    // Find the erstaurant & update
    const restaurant = await Restaurant.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true
    }).exec();
    // Redirect to restaurant & flash
    req.flash('success', `Successfully updated ${restaurant.name}.`);
    res.redirect(`/restaurants/${restaurant._id}/edit`);

}

exports.getRestaurant = async(req, res) => {

    const restaurant = await Restaurant.findOne({ slug: req.params.slug }).populate('author');
    if (!restaurant) return next();
    res.render('restaurant', { title: `${restaurant.name}`, restaurant });
}

exports.searchRestaurants = async (req, res) => {
  const restaurants = await Restaurant
  // find by query
  .find({
    $text: {
      $search: req.query.q,
    }
  }, {
    score: { $meta: 'textScore' }
  })
  //sort by score
  .sort({
    score: { $meta: 'textScore' }
  })
  // limit results
  .limit(5);
  res.json(restaurants);

}

exports.mapRestaurants = async (req, res) => {
  const coordinates = [req.query.lat, req.query.lng].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: 10000
      }
    }
  }
  const restaurants = await Restaurant.find(q).select("slug name description photo location").limit(10);
  res.json(restaurants);
}

exports.mapPage = (req, res) => {
  res.render('map', {title: 'Restaurants Map'})
}

exports.heart = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User.findByIdAndUpdate(req.user._id,
    { [operator]: {hearts: req.params.id }},
    { new: true }
  );
  res.json(user);
}

exports.hearted = async (req, res) => {
  const userHearts = req.user.hearts;
  const restaurants = await Restaurant.find({ _id: userHearts });
  res.render('hearts', {title: 'Hearts', restaurants});
}

exports.getTopRestaurants = async (req, res) => {
  const restaurants = await Restaurant.getTopRestaurants();
  res.render('top', {restaurants, title: 'Top Restaurants'});
}