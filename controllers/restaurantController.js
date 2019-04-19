const mongoose = require('mongoose');
const Restaurant = mongoose.model('Restaurant');
const multer = require('multer'); // handles image uploading 
const jimp = require('jimp'); //resizes images
const uuid = require('uuid'); //uniqure identifiers for images

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
    const restaurantsPromise = Restaurant.find({ tags: tagQuery });
    const [tags, restaurants] = await Promise.all([tagsPromise, restaurantsPromise]); // multiple query promise
    res.render('restaurants', { title: 'Restaurants', restaurants, tags, tag, user });

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