// Page Routes
var auth = require('../controllers/auth')
var test = require('../controllers/twitterscrape');
var User = require('../models/user')

module.exports = function(app) {
  app.get('/', function (req, res) {
    res.render('index.ejs', {user: req.user, title: "Capsule"});
  });

  app.get('/signin', auth.alreadyAuthed, function(req, res) {
    var type = req.query.type != null ? req.query.type : 'in'
    res.render('signin.ejs', { message: req.flash('message') , user: req.user, inOrUp: req.query.type, title: "Sign In/Up"})
  });

  app.get('/app', auth.isAuthed, function(req, res) {
    res.render('app.ejs', {user: req.user, title: "Capsule", verified: req.user.verified})
  })

  app.get('/profile', auth.isAuthed, function(req, res) {
	  res.render('profile.ejs', {user: req.user, errorMessage: req.flash('error'), title: "My Profile"});
  })
}
