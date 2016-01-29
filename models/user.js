var mongoose = require('mongoose')

var UserSchema = mongoose.Schema({
  email: String,
  name: String,
  password: String,
  level: {type: Number, default: 0},
  verified: Boolean,
  admin: {type: Boolean, default: false},
  upvotes: {type: [String], default: []},
  downvotes: {type: [String], default: []},
  repredicts: {type: [String], default: []}
})

module.exports = mongoose.model('user', UserSchema)
