var request = require('request')
var cheerio = require('cheerio')

exports.getMetadata = function(url, callback) {
  request(url, function(error, response, html) {
    if (error) {
      return error
    }
    var $ = cheerio.load(html)
    var meta = {
      'url': url,
      'title': $("title").text(),
      'image': $('meta[property="og:image"]').attr('content')
    }
    return callback(meta)
  })
}
