var mongoose = require('mongoose');
var reviews_model = mongoose.model('Locations');
var sendJsonResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

var addReviewToLocation = function (req, res, data) {
    if (!data) {
        sendJsonResponse(res, 404, 'no data available for the location');
    } else {
        // return;
        console.log('POSTING THE DATA : ', data);
        data.reviews.push({
            author: req.body.author,
            rating: req.body.rating,
            reviewText: req.body.reviewText
        });
        data.save(function (err, data) {
            if (err) {
                sendJsonResponse(res, 404, err);
            } else {
                var review;
                review = data.reviews[data.reviews.length - 1];
                updateAverageRating(data._id);
                sendJsonResponse(res, 201, review);
            }
        })
    }
};

var updateAverageRating = function (locationId) {
    reviews_model
        .findById(locationId)
        .select('rating reviews')
        .exec(function (err, data) {
            if (!err) {
                setAverageRating(data);
            }
        });
}

var setAverageRating = function (data) {
    var i, reviewCount, ratingAvg, ratingTotal;
    if (data.reviews && data.reviews.length > 0) {
        reviewCount = data.reviews.length;
        ratingTotal = 0;
        for (i = 0; i < reviewCount; i++)
            ratingTotal += data.reviews[i].rating;
        ratingAvg = parseInt(ratingTotal / reviewCount, 10);
        data.rating = ratingAvg;
        data.save(function (err) {
            if (err)
                console.log(err);
            else
                console.log("Average Rating :" + ratingAvg);
        });
    }
};

module.exports.reviewsCreate = function (req, res) {
    var locationId = req.params.locationId;
    if (locationId) {
        reviews_model
            .findById(locationId)
            .select('reviews')
            .exec(function (err, data) {
                if (err) {
                    sendJsonResponse(res, 404, {message: 'location not found'});
                } else {
                    addReviewToLocation(req, res, data);
                }
            });

    } else {
        sendJsonResponse(res, 404, {message: 'url not correct'});
    }

    // sendJsonResponse(res, 200, {"status": "success"});
};

module.exports.reviewsReadOne = function (req, res) {
    if (req.params && req.params.locationId && req.params.reviewId) {
        reviews_model
            .findById(req.params.locationId)
            .select('name reviews')
            .exec(function (err, data) {
                if (!data) {
                    sendJsonResponse(res, 404, 'Data for LocationId not Found');
                    return;
                }
                else if (err) {
                    sendJsonResponse(res, 404, err)
                    return;
                }
                if (data.reviews && data.reviews.length > 0) {
                    var review;
                    review = data.reviews.id(req.params.reviewId);
                    console.log(review);
                    console.log(data);
                    if (!review) {
                        sendJsonResponse(res, 404, {"message": "Review for the ID NOT FOUND"});
                        return;
                    }
                    var response = {
                        location: {
                            name: data.name,
                            id: req.params.locationId
                        },
                        review: review
                    };
                    sendJsonResponse(res, 200, response);
                }

            });
    }
    else {
        sendJsonResponse(res, 404, {"message": "URL not available"});
    }
    // sendJsonResponse(res, 200, {"status": "success"});
};

module.exports.reviewsUpdateOne = function (req, res) {
///locations/:locationId/reviews/:reviewId
    if (req.params && req.params.locationId && req.params.reviewId) {
        reviews_model
            .findById(req.params.locationId)
            .select('name reviews rating')
            .exec(function (err, data) {
                if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                } else if (!data) {
                    sendJsonResponse(res, 404, 'Data Not Found: For the location');
                    return;
                }
                if (data.reviews && data.reviews.length > 0) {
                    var review = data.reviews.id(req.params.reviewId);
                    console.log(review);
                    if (review) {
                        review.author = req.body.author;
                        review.rating = req.body.rating;

                        data.save(function (err, data) {
                            if (err) {
                                sendJsonResponse(res, 404, err);
                                return;
                            } else {
                                updateAverageRating(req.params.locationId);
                                sendJsonResponse(res, 200, review);
                            }
                        });
                    }
                    else {
                        sendJsonResponse(res, 404, {status: "No Review Found"});
                    }
                } else {
                    sendJsonResponse(res, 404, {status: "No Reviews Found: for the given locationID"});
                }
            });
    } else {
        sendJsonResponse(res, 404, {"status": "Parameters Missing: Path not correct"});
    }
};

module.exports.reviewsDeleteOne = function (req, res) {
    if (req.params && req.params.locationId && req.params.reviewId) {
        reviews_model
            .findById(req.params.locationId)
            .select('reviews rating')
            .exec(function (err, data) {
                if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                } else if (!data) {
                    sendJsonResponse(res, 404, 'data not found: for the location');
                    return;
                }
                if (data.reviews && data.reviews.length > 0) {
                    var review = data.reviews.id(req.params.reviewId);
                    if (review) {
                        data.reviews.id(req.params.reviewId).remove();
                        data.save(function (err, data) {
                            if (err) {
                                sendJsonResponse(res, 404, err);
                                return;
                            } else {
                                updateAverageRating(req.params.locationId);
                                sendJsonResponse(res, 204, null);
                            }
                        });
                    }
                    else {
                        sendJsonResponse(res, 404, {status: "no review found"});
                    }
                } else {
                    sendJsonResponse(res, 404, {status: "No Reviews Found: for the given locationID"});
                }
            });
    } else {
        sendJsonResponse(res, 404, {"status": "Parameters Missing: Path not correct"});
    }
    // sendJsonResponse(res, 200, {"status": "success"});
};