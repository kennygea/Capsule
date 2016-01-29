bcrypt = require('bcryptjs')

exports.isAuthed = function(req, res, next) {
  if(req.isAuthenticated())
    return next();
  res.redirect('/signin')
}

exports.errorCatch = function(req, res, next) {
  res.status(404)
  res.redirect('/404')
}

exports.alreadyAuthed = function(req, res, next) {
  if (!req.isAuthenticated())
    return next();
  res.redirect('/app')
}

exports.isAdmin = function(req, res, next) {
  if (req.isAuthenticated())
    if (req.user.admin)
      return next();
  res.redirect('/')
}

exports.createHash = function(pwd) {
  return bcrypt.hashSync(pwd, 10)
}

exports.checkHash = function(pwd, hash) {
  return bcrypt.compareSync(pwd, hash)
}
