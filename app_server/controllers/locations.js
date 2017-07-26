var request = require('request');
var port = 4000;

/* GET home page. */
var home_object = {
    title: 'Loc8r',
    side_title: 'Loc8r helps you to find the places to work when out and about',
    title_element: {
        name: 'Loc8r',
        desc: 'Find the places to work with wifi near you'
    },
    // locations_list: [{
    //     name: 'StarCups',
    //     address: '124 High Street, Reading, Marathalli',
    //     distance: '120m',
    //     items: [
    //         'Veg Food',
    //         'Non-Veg Food',
    //         'Hot-n-Cold Drinks'
    //     ],
    //     rating: 5
    // }, {
    //     name: 'StarMugs',
    //     address: '124 High Street, Reading, Marathalli',
    //     distance: '120m',
    //     items: [
    //         'Hot Drinks',
    //         'Cold Drinks',
    //         'Hot-n-Cold Drinks'
    //     ],
    //     rating: 4
    // }, {
    //     name: 'StarBottles',
    //     address: '124 High Street, Reading, Marathalli',
    //     distance: '120m',
    //     items: [
    //         'Fish',
    //         'Shark'
    //     ],
    //     rating: 3
    // }]
};

var renderHomeList = function (req, res) {
    /*using the request module
     * request(options, callback)
     * options {url, method, json, qs}
     * callback(err, response, body)
     * */
    var requestOptions = {
        url: 'http://localhost:' + port + '/api/locations',
        method: 'GET',
        json: {},
        qs: {
            lng: 77.6657550,
            ltd: 12.9583670
        }
    };
    request(requestOptions, function (err, response, body) {
        // console.log(response);
        if (err) {
            console.log(err);
            // res.json(err);
            home_object.locations_list = [];
            home_object.message = err;
            res.render('locations-list', home_object);
            res.status(404);
        }
        else if (!body) {
            // res.json({"message": "error: data not found"});
            res.status(404);
            home_object.locations_list = [];
            home_object.message = 'ERROR: Not Location Found Near By';
            res.render('locations-list', home_object);
        }
        else {
            if (response.statusCode === 200) {
                res.status(200);
                home_object.locations_list = body;
                res.render('locations-list', home_object);
            } else {
                res.status(response.statusCode);
                home_object.locations_list = [];
                home_object.message = "status: " + response.statusCode + " " + response.body.message;
                res.render('locations-list', home_object);
            }

        }
        // res.json(body);
    });
    // res.render('locations-list', body);
};

module.exports.homeList = function (req, res) {
    // res.render('index', {
    //     title: 'Index : Express Application'
    // })
    // res.render('locations-list', home_object)
    renderHomeList(req, res);
};

var getLocationInfo = function (req, res, callback) {
    if (req.params && req.params.locationId) {
        var requestOptions = {
            url: "http://localhost:" + port + "/api/locations/" + req.params.locationId,
            method: "GET",
            json: {},
            qs: {}
        };

        request(requestOptions, function (err, response, body) {
            if (err) {
                res.status(404);
                res.render('generic-text', {title: 'Error Occured', content: err});
            }
            if (response.statusCode === 200) {
                callback(req, res, body);
            } else {
                res.status(404);
                res.render('generic-text', {title: 'Something went wrong', content: body});
            }
        });
        console.log(req.params.locationId);
    } else {
        console.log({message: "error list"});
    }
};

var renderLocation = function (req, res, data) {
    res.render('location-info', data);
};
/* GET location home page. */
module.exports.locationInfo = function (req, res) {
    getLocationInfo(req, res, function (req, res, data) {
        renderLocation(req, res, data);
    });
};
/* GET location add review. */
var showLocationReviewScreen = function (req, res) {
    if (req.params && req.params.locationId) {
        var requestOptions = {
            url: "http://localhost:" + port + "/api/locations/" + req.params.locationId + "/reviews",
            method: "POST",
            json: {author: req.body.name, rating: parseInt(req.body.rating, 10), reviewText: req.body.review},
            qs: {}
        };
        console.log(req.params.locationId);

        if (!req.body.name || !req.body.rating || !req.body.review) {
            console.log('fields are not filled');
            res.redirect('/location/' + req.params.locationId + '/review/new?err=val');
        } else {

            request(requestOptions, function (err, response, body) {
                if (err) {
                    res.render('generic-text', {title: 'Error', content: err.message});
                } else {
                    console.log(response.statusCode);
                    if (response.statusCode === 201) {
                        // console.log(body);
                        res.redirect('/location/' + req.params.locationId);
                    }
                    else if (response.statusCode === 404 && body.name && body.name === 'ValidationError') {
                        res.redirect('/location/' + req.params.locationId + '/review/new?err=val');
                    }
                }
            });
        }

    } else {
        res.status(404);
        res.render('generic-text', {title: 'LocationID Not Found', content: 'URL is NOT CORRECT'});
    }
};

module.exports.addReview = function (req, res) {
    showLocationReviewScreen(req, res);
};

module.exports.addReviewScreen = function (req, res) {
    getLocationInfo(req, res, function (req, res, data) {
        res.render('location-review', {
            'title': 'Review : ' + data.name,
            'data': data,
            'error': req.query.err
        })
    });
};
