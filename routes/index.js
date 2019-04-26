const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(restaurantController.getRestaurants));
router.get('/restaurants', catchErrors(restaurantController.getRestaurants));
router.get('/restaurants/:tag', catchErrors(restaurantController.getRestaurants));

router.get('/add',
    authController.isLoggedIn,
    restaurantController.addRestaurant
);

router.post('/add',
    restaurantController.upload,
    catchErrors(restaurantController.resize),
    catchErrors(restaurantController.createRestaurant)
);
router.post('/add/:id',
    restaurantController.upload,
    catchErrors(restaurantController.resize),
    catchErrors(restaurantController.updateRestaurant)
);

router.get('/restaurants/:id/edit', catchErrors(restaurantController.editRestaurant));

router.get('/restaurant/:slug', catchErrors(restaurantController.getRestaurant));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get('/register', userController.registerForm);
router.post('/register',
    userController.validateRegister,
    userController.register,
    authController.login
);

router.get('/logout', authController.logout);

router.get('/account',
    authController.isLoggedIn,
    userController.account
);

router.post('/account', catchErrors(userController.updateAccount));

router.post('/account/forgot', catchErrors(authController.forgot));

router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
    authController.passwordsMatch,
    catchErrors(authController.update)
);

router.get('/map', restaurantController.mapPage);

router.get('/hearts', authController.isLoggedIn, catchErrors(restaurantController.hearted));

router.post('/reviews/:id', authController.isLoggedIn, catchErrors(reviewController.addReview));

router.get('/top', catchErrors(restaurantController.getTopRestaurants));


// API Endpoints
router.get('/api/search', catchErrors(restaurantController.searchRestaurants));
router.get('/api/restaurants/near', catchErrors(restaurantController.mapRestaurants))
router.post('/api/restaurants/:id/heart', catchErrors(restaurantController.heart));


module.exports = router;