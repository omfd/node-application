var mongoose = require('mongoose');
var location_model = mongoose.model('Locations');


// location_model.fin
var sendJsonResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

var theEarth = (function () {
    var earthRadius = 6371;

    var convertToKMs = function (distance) {
        return parseFloat(distance / 1000).toFixed(2) + ' km';
    };

    var getRadsFromDistance = function (distance) {
        return parseFloat(distance / earthRadius);
    };

    return {
        convertTOKMs: convertToKMs,
        getRadsFromDistance: getRadsFromDistance
    };
})();

var geoNearCallback = function (err, data, stats) {
    console.log(data);
    var locations = [];
    data.forEach(function (doc) {
        locations.push({
            distance: theEarth.convertTOKMs(doc.dis),
            name: doc.obj.name,
            address: doc.obj.address,
            rating: doc.obj.rating,
            facilities: doc.obj.facilities,
            _id: doc.obj._id
        });

    });
    console.log(locations);
};

module.exports.locationsCreate = function (req, res) {
    console.log(req.body);
    // sendJsonResponse(res, 200, req.body);
    // return;
    location_model.create({
        name: req.body.name,
        address: req.body.address,
        facilities: req.body.facilities.split(','),
        coordinates: [parseFloat(req.body.lng), parseFloat(req.body.ltd)],
        timings: [{
            "days": req.body.day1,
            "opening": req.body.opening1,
            "closing": req.body.closing1,
            "closed": req.body.closed1
        },
            {
                "days": req.body.day2,
                "opening": req.body.opening2,
                "closing": req.body.closing2,
                "closed": req.body.closed2
            }]
    }, function (err, data) {
        if (err) {
            console.log(err);
            sendJsonResponse(res, 404, err);
        } else {
            sendJsonResponse(res, 201, data);
        }
    });
    // sendJsonResponse(res, 200, {"status": "success"});
};

module.exports.locationsListByDistance = function (req, res) {
    var lng = parseFloat(req.query.lng);
    var ltd = parseFloat(req.query.ltd);
    if (!lng || !ltd) {
        sendJsonResponse(res, 404, {message: "missing lng or ltd"});
        return;
    }
    var geoPointXY = {
        type: "Point",
        coordinates: [lng, ltd]
    };
    var geoOptions = {
        spherical: true,
        // maxDistance: theEarth.getRadsFromDistance(20000.0),
        num: 10
    };
    location_model.geoNear(geoPointXY, geoOptions, function (err, results, stats) {

        if (!results) {
            sendJsonResponse(res, 404, {message: "no locations found !"});
            return;
        } else if (err) {
            sendJsonResponse(res, 404, err);
            return;
        }
        console.log(err);
        var locations = [];
        results.forEach(function (doc) {
            locations.push({
                distance: theEarth.convertTOKMs(doc.dis),
                dist: (0.001 * doc.dis).toFixed(2),
                name: doc.obj.name,
                address: doc.obj.address,
                _id: doc.obj._id,
                rating: doc.obj.rating,
                items:doc.obj.facilities
            });
        });
        sendJsonResponse(res, 200, locations);
    });
    // sendJsonResponse(res, 200, {"status": "success"});
};

module.exports.locationsReadOne = function (req, res) {
    location_model
        .findById(req.params.locationId)
        .exec(function (err, location) {
            if (req.params && req.params.locationId) {
                if (!location) {
                    sendJsonResponse(res, 404, {"message": "No Location Information Found"});
                    return;
                }
                else if (err) {
                    sendJsonResponse(res, 404, {"message": "Error"});
                    return;
                }
                sendJsonResponse(res, 200, location);
            } else {
                sendJsonResponse(res, 404, {"message": "No LocationId in the request!"})
            }
            // sendJsonResponse(res, 200, location);
        });
};

module.exports.locationsUpdateOne = function (req, res) {
    var response = {};
    if (!req.params && !req.params.locationId) {
        sendJsonResponse(res, 404, {message: 'Wrong URL: missing locationID'});
        return;
    } else {
        if (!req.params.locationId) {
            sendJsonResponse(res, 404, {message: 'Wrong URL: missing locationID'});
            return;
        } else {
            location_model
                .findById(req.params.locationId)
                .select('-reviews -rating')
                .exec(function (err, data) {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                        return;
                    } else {
                        if (!data) {
                            sendJsonResponse(res, 404, {message: "Missing Location Data: no data found"});
                            return;
                        } else {
                            response.old_address = data.address;
                            data.address = req.body.address;
                            response.new_address = data.address;
                        }
                    }
                    data.save(function (err, data) {
                        if (err)
                            sendJsonResponse(res, 404, err);
                        else {
                            sendJsonResponse(res, 200, response);
                        }
                    })
                });
        }
    }

    // sendJsonResponse(res, 200, {"status": "success"});
};

module.exports.locationsDeleteOne = function (req, res) {
    /*'/locations/:locationId*/
    if (req.params && req.params.locationId) {
        location_model
            .findByIdAndRemove(req.params.locationId)
            .exec(function (err, data) {
                if (err) {
                    sendJsonResponse(res, 404, err);
                } else {
                    sendJsonResponse(res, 204, null);
                }
            });
    } else {
        sendJsonResponse(res, 200, {"status": "Location Not Found: Id is incorrect"});
    }
};