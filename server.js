// Dependencies
var express = require('express');
var fs = require('fs')
var mongoose = require('mongoose')
var moment = require('moment')
var passport = require('passport')
var expressSession = require('express-session')
var bcrypt = require('bcryptjs')
var flash = require('connect-flash')
var bodyParser = require('body-parser')
var scheduler = require('./controllers/scheduler')
var auth = require('./controllers/auth')
var http = require('http')
var io = require('socket.io')
var commandLineArgs = require('command-line-args')

// App Setup
var app = express();
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/partials'));
app.use(express.static(__dirname + '/javascript'));
app.use(expressSession({secret: 'mySecretKey'}))
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.engine('.html', require('ejs').__express);

//Command Line Arguments
var cli = commandLineArgs([
  { name: 'no-scrape', alias: 'n', type: Boolean }
])

//Sockets Setup
var server = http.createServer(app)
io = io.listen(server)

// MongoDB Setup
mongoose.connect('mongodb://localhost:27017/capsule')
require('./routing/routes.js')(app, passport)
require('./routing/authroutes.js')(app, passport)
require('./routing/api.js')(app)
require('./routing/adminroutes.js')(app, passport)
require('./routing/errorroutes.js')(app)
scheduler.checkCapsule(cli.parse())
app.use(auth.errorCatch)

// Main Init
var server = app.listen(3000 , function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening!');
});
