var LocalStrategy = require('passport-local').Strategy
var User = require('../models/user')
var auth = require('../controllers/auth')
//var mongo_express = require('mongo-express/lib/middleware')
//var mongo_express_config = require('../node_modules/mongo-express/config.default.js')

module.exports = function(app, passport) {
  //app.use('/admin/mongo', auth.isAdmin, mongo_express(mongo_express_config))
}
