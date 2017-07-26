/* GET home page. */
module.exports.othersInfo = function(req, res) {
  res.render('about-us', {
    title: 'About'
  })
};

module.exports.aboutInfo = function(req, res) {
  res.render('about-us', {
    title: 'About Link'
  })
};
