const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(restaurantController.getRestaurants));
router.get('/restaurants', catchErrors(restaurantController.getRestaurants));
router.get('/add', restaurantController.addRestaurant);
router.post('/add', catchErrors(restaurantController.createRestaurant));

module.exports = router;