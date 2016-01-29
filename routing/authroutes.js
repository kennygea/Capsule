var bcrypt = require('bcryptjs')
var LocalStrategy = require('passport-local').Strategy
var User = require('../models/user')
var auth = require('../controllers/auth')

module.exports = function(app, passport) {
  passport.serializeUser(function(user, done) {
    done(null, user);
  })

  passport.deserializeUser(function(user, done) {
    done(null, user);
  })

  passport.use('login', new LocalStrategy({
    passReqToCallback: true,
    passwordField: 'signinpassword'
  },
  function (req, username, password, done) {
    process.nextTick(function() {
      User.findOne({
        'email': username,
      }, function(err, user) {
        if (err) {
          return done(err['name'])
        }
        if (!user) {
          return done(null, false, req.flash('message','User Does Not Exist'))
        }
        if (!auth.checkHash(password, user.password)) {
          return done(null, false, req.flash('message','Incorrect Password'))
        }
        return done(null, user)
      })
    });
  }));

  passport.use('signup', new LocalStrategy({
      passReqToCallback: true
    },
    function (req, username, password, done) {
      process.nextTick(function() {
        console.log("Signing Up")
        User.findOne({'email': username}, function(err, user) {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, false,
               req.flash('message','User Already Exists'));
          } else {
            var newUser = new User();
            newUser.email = username;
            newUser.password = auth.createHash(password);
            newUser.name = req.param('name');
            newUser.verified = false;

            newUser.save(function(err) {
              if (err){
                throw err;
              }
              return done(null, newUser);
            });
          }
        });
    })
  }))
  

  app.post('/login', passport.authenticate('login', {
    successRedirect: '/app',
    failureRedirect: '/signin',
    failureFlash: 'Invalid username or password'
  }))

  app.post('/signup', passport.authenticate('signup', {
    successRedirect: '/app',
    failureRedirect: '/signin',
    failureFlash: true
  }))

  app.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/')
  })
 
  
  app.post('/updatepassword', function(req, res) {
		console.log(req.user.email)
		User.findOne({
			'email': req.user.email,
		  }, function(err, user) {
			if (err) {
				console.log('eh?');
			  res.redirect('/profile')
			}
			if (!auth.checkHash(req.body.previouspassword, user.password)) {
				req.flash("error", "Wrong password!")
				res.redirect('/profile');
				return;
			}
			if (req.body.newpassword !== req.body.confirmnewpassword) {
				req.flash("error", "Passwords don't match!")
				res.redirect('/profile');
				return;
			}
			else {
			console.log("updating");
			User.update({
				'email': req.user.email,
			}, 
			{$set: {'password': auth.createHash(req.body.confirmnewpassword)}},
			function(err, count, status){
				console.log(count);
				if (err) {
					console.log('failed to update')
					res.redirect('/profile')
				}
				else {
					console.log('success');
					res.redirect('/')
				}
			});
			}
			
		});
  });
}
