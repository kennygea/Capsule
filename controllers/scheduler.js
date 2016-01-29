var later = require('later')
var predSchema = require('../models/prediction')
var twitterscrape = require('../controllers/twitterscrape')
var moment = require('moment')
var googlesearch = require('../controllers/googlesearch')

exports.checkCapsule = function(options) {
	var predSched = later.parse.recur().every(1).minute().first().second();
	later.setInterval(function() {
		if (!options['no-scrape']) {
			twitterscrape.update()
		}
		googlesearch.linksUpdate()
		predSchema.cycle()
	}, predSched);
}
