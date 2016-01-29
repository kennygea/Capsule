var mongoose = require('mongoose')
var moment = require('moment')
var random = require('mongoose-simple-random')

var PredictionSchema = mongoose.Schema({
  userID: {type: String, default: "admin"}, // For testing purposes
  username: String,
  posted: {type: Date, default: Date.now},
  planDates: [Date],
  text: {type: String, default: ""},
  hashtags: {type: [String], default: []},
  links: {type: [mongoose.Schema.Types.Mixed], default: []},
  linkScore: {type: Number, default: 0},
  upvotes: {type: Number, default: 0},
  downvotes: {type: Number, default: 0},
  state: {type: Number, default: 0}, // 0 = contribution, 1 = buried, 2 = uncovered
  reprediction: {type: Boolean, default: false},
  tophashtag: {type: String, default: ""},
  tophashtagpopularity: {type: Number, default: 0.0},
  repredicts: {type: Number, default: 0}
})

PredictionSchema.pre('save', function(next) {
  var initialDate = moment(this.posted).endOf('minute').subtract(10, 'second')
  var firstDate = initialDate.clone()
  initialDate.add(1, 'm')
  this.planDates = [firstDate.toDate(), initialDate.toDate()]
  next()
})

PredictionSchema.plugin(random)

PredictionSchema.statics.allBuried = function(callback) {
  return this.model('prediction').findRandom({
    $or: [
      {
        'tophashtagpopularity': 0.0,
        'state': 2
      }, {
        'state': 1
      }
    ]
  }, {}, {limit: 5}, callback)
}

PredictionSchema.statics.allBuriedLinks = function (callback) {
  return this.model('prediction').findRandom({
    $or: [
      {
        'linkScore': 0,
        'state': 2
      }, {
        'state': 1
      }
    ]
  }, {}, {limit: 5}, callback)
}

PredictionSchema.statics.cycle = function() {
  this.model('prediction').find({
    'state': {$lte: 1}
  }, function(err, preds) {
    if (err) {
      console.log(err);
    }
    else {
      for(var i = 0; i < preds.length; i++) {
        var prediction = preds[i]
        if (moment().isAfter(prediction.planDates[prediction.state])) {
          prediction.state = prediction.state + 1
          prediction.save()
        }
      }
    }
  })
}

module.exports = mongoose.model('prediction', PredictionSchema);
