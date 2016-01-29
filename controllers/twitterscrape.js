//twitter-scraper.js
var request = require('request');
var cheerio = require('cheerio');
var phantom = require('phantom');
var later = require('later')
var Prediction = require('../models/prediction')
var path = require('path');
var appDir = path.dirname(require.main.filename);

var singleScrape = function(hashtag, callback) {
	var url = "http://hashtagify.me/hashtag/" + hashtag
	options = {'load-images': 'no'}

	phantom.create(function(ph) {
	  return ph.createPage(function(page) {
			return page.open(url, function(status) {
			  page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function(err) {
					setTimeout(function() {
					  return page.evaluate(function() {
							var popularity = $('.title_content.hashtag_popularity').text()
							return popularity
					  }, function(result) {
							callback(result)
							page.close();
							ph.exit();
					  });
					}, 2000);
			  })
			})
	  })
	}, options);
}

exports.update = function() {
  Prediction.allBuried(function(err, results){
		results.forEach(function(prediction){
		  var tempTopHashtag = "";
		  var tempPopularity = 0.0;
		  var i = 0;
		  prediction.hashtags.forEach(function(hashtagString) {
				var arr = hashtagString.split(" ")
				arr.forEach(function(hashtag) {
					var stripped = hashtag.replace("#", "")
					singleScrape(stripped, function(popularity) {
						i += 1
						if (popularity > tempPopularity) {
							tempPopularity = popularity;
							tempTopHashtag = hashtag;
						}
						if (i == prediction.hashtags.length) {
							if (tempPopularity > prediction.tophashtagpopularity) {
								Prediction.update({'_id': prediction['_id']},{$set: {'tophashtag': tempTopHashtag, 'tophashtagpopularity': tempPopularity}}, function(err, res) {
									console.log(res);
								});
							}
						}
					})
				})
		  })
	  })
  })
}
