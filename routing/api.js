var Prediction = require('../models/prediction')
var User = require('../models/user')
var mongoose = require('mongoose')

module.exports = function(app) {
  var predictionExists = function(prediction, callback) {
    Prediction.find({
      'userID': prediction.userID,
      'username': prediction.username,
      'text': prediction.text
    }, function(err, pred) {
      if (err) console.log(err);
      if (pred.length > 0) { callback(true); }
      else { callback(false)}
    })
  }

  app.all('/api/*', function(req,res,next){
      if(req.isAuthenticated()){
          next();
      }else{
          next(new Error(401)); // 401 Not Authorized
      }
  });

  app.get('/api/predictions/:state', function(req, res) {
    Prediction.find({
      'state': parseInt(req.params.state),
      'reprediction': false
    })
    .sort({'upvotes': -1, 'downvotes': 1})
    .exec(function(err, data) {
      res.json(data);
    })
  })

  app.get('/api/prediction/:id', function (req, res) {
    Prediction.find({
      '_id': req.params.id
    }, function(err, pred) {
      if (err) console.log(err);;
      res.json(pred)
    })
  })

  app.post('/api/predictions', function(req, res) {
    var newPrediction = new Prediction()
    newPrediction.userID = req.user['_id']
    newPrediction.username = req.user['name']
    newPrediction.text = req.body.text
    newPrediction.hashtags = req.body.hashtags
    predictionExists(newPrediction, function(exists) {
      if (exists) { res.send("exists") }
      else {
        newPrediction.save(function(err) {
          if (err)
            throw error
          else
            res.send("Success!")
        })
      }
    })
  })

  app.post('/api/verify', function(req, res) {
    User.findById(req.user['_id'], function(err, user) {
      user.verified = true;
      user.save(function(err) {
        req.login(user, function(err) {
          res.send("Done");
        })
      });
    })
  })

  app.get('/api/ongoing-predictions/', function(req,res) {
	  Prediction.find({
      'username': req.user['name']
		}, function(err, pred) {
		  if (err) {console.log(err);;}
		  else {
			contributing = []
			pred.forEach(function(currentValue) {
				if (currentValue['state'] === 0) {
					contributing.push(currentValue);
				}
			});
			res.json(contributing);
		  }
		})
  })

  app.get('/api/opened-predictions/', function(req,res) {
	  Prediction.find({
      'username': req.user['name']
		}, function(err, pred) {
		  if (err) {console.log(err);;}
		  else {
			contributing = []
			pred.forEach(function(currentValue) {
				if (currentValue['state'] === 2) {
					contributing.push(currentValue);
				}
			});
			res.json(contributing);
		  }
		})
  })

  app.post('/api/upvote', function (req, res) {
    Prediction.findById(req.body.predid, function (err, pred) {
      if (err) console.log(err);;
      User.findById(req.user['_id'], function (err, user) {
        var upindex = user.upvotes.indexOf(pred['_id'])
        var downindex = user.downvotes.indexOf(pred['_id'])
        if (upindex == -1 && downindex == -1) {
          pred.upvotes += 1
          user.upvotes.push(pred['_id'])
        } else if (upindex > -1) {
          pred.upvotes += -1
          user.upvotes.splice(upindex, 1)
        } else if (downindex > -1) {
          pred.upvotes += 1
          pred.downvotes += -1
          user.upvotes.push(pred['_id'])
          user.downvotes.splice(downindex, 1)
        }

        pred.save(function (err) {
          if (err) console.log(err);;
          user.save(function (err) {
            if (err) console.log(err);;
            req.login(user, function(err) {
              if (err) return next(err)
              res.send(pred);
            })
          });
        });

      })
    })
  })

  app.post('/api/downvote', function (req, res) {
    Prediction.findById(req.body.predid, function (err, pred) {
      if (err) console.log(err);;
      User.findById(req.user['_id'], function (err, user) {
        var upindex = user.upvotes.indexOf(pred['_id'])
        var downindex = user.downvotes.indexOf(pred['_id'])
        if (upindex == -1 && downindex == -1) {
          pred.downvotes += 1
          user.downvotes.push(pred['_id'])
        } else if (downindex > -1) {
          pred.downvotes += -1
          user.downvotes.splice(downindex, 1)
        } else if (upindex > -1) {
          pred.downvotes += 1
          pred.upvotes += -1
          user.downvotes.push(pred['_id'])
          user.upvotes.splice(upindex, 1)
        }

        pred.save(function (err) {
          if (err) console.log(err);;
          user.save(function (err) {
            if (err) console.log(err);;
            req.login(user, function(err) {
              if (err) return next(err)
              res.send(pred);
            })
          });
        });
      })
    })
  })

  app.post('/api/repredict', function(req, res) {
    Prediction.findById(req.body.predid, function(err, pred) {
      User.findById(req.user['_id'], function(err, user) {
        if (err) console.log(err);

        var repredict = new Prediction()
        repredict.text = pred.text
        repredict.userID = req.user['_id']
        repredict.reprediction = true
        repredict.username = req.user.name
        repredict.hashtags = pred.hashtags
        repredict.planDates = pred.planDates

        var repredictIndex = user.repredicts.indexOf(req.body.predid)
        if (repredictIndex == -1) {
          user.repredicts.push(req.body.predid)
          pred.repredicts += 1
        } else {
          user.repredicts.splice(repredictIndex, 1)
          pred.repredicts -= 1
        }

        repredict.save(function(err) {
          if (err) console.log(err)
          pred.save(function (err) {
            if (err) console.log(err);;
            user.save(function (err) {
              if (err) console.log(err);;
              req.login(user, function(err) {
                if (err) return next(err)
                res.send(pred);
              })
            });
          });
        })
      })
    })
  })

  app.get('/api/user', function (req, res) {
    res.json(req.user);
  })
}
