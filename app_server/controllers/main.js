/* GET home page. */
module.exports.homepageController = function (req, res) {
    res.render('index', {
        title: 'Express Application'
    })
};
module.exports.helppageController = function (req, res) {
    res.render('index', {
        'title': 'Help : Express Application'
    })
};
//module.exports = helppageController;