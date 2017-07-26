var express = require('express');
var router = express.Router();

var locationsController = require('../controllers/locations');
var reviewsController = require('../controllers/reviews');

//locations api's
router.get('/locations', locationsController.locationsListByDistance);
router.post('/locations', locationsController.locationsCreate);
router.get('/locations/:locationId', locationsController.locationsReadOne);
router.put('/locations/:locationId', locationsController.locationsUpdateOne);
router.delete('/locations/:locationId', locationsController.locationsDeleteOne);

//reviews api's
router.post('/locations/:locationId/reviews', reviewsController.reviewsCreate);
router.get('/locations/:locationId/reviews/:reviewId', reviewsController.reviewsReadOne);
router.put('/locations/:locationId/reviews/:reviewId', reviewsController.reviewsUpdateOne);
router.delete('/locations/:locationId/reviews/:reviewId', reviewsController.reviewsDeleteOne);

module.exports = router;