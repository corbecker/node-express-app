const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(restaurantController.getRestaurants));
router.get('/restaurants', catchErrors(restaurantController.getRestaurants));
router.get('/restaurants/:tag', catchErrors(restaurantController.getRestaurants));

router.get('/add', restaurantController.addRestaurant);
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

router.get('/register', userController.registerForm);
router.post('/register',
    userController.validateRegister,
    userController.register,
    authController.login
);



module.exports = router;