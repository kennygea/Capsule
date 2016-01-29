var google = require('googleapis');
var natural = require('natural');
var customsearch = google.customsearch('v1');
var scrape = require('../controllers/scrape')
var Prediction = require('../models/prediction')

// You can get a custom search engine id at
// https://www.google.com/cse/create/new
const CX = '009805257781953998575:_pifmt0u5tw';
const API_KEY = 'AIzaSyDfdVuuzi4ozJuzHVG3zGdYqGQMf_CpKGk';

var googleSearch = function (query, callback) {
	customsearch.cse.list({ cx: CX, q: query, auth: API_KEY }, function(err, resp) {
	  if (err) {
			console.log('An error occured', err);
			return;
	  }
	  // Got the response from custom search
	  console.log('Result: ' + resp.searchInformation.formattedTotalResults);
	  var toplinks = []
	  if (resp.items && resp.items.length > 0) {
			counter = 3;
		    if (resp.items.length < 3) {
				counter = resp.items.length;
			}
			var snipets = []
			var links = []
			for (var i = 0; i < counter; i++) {
				var url = resp.items[i].link
				var meta = scrape.getMetadata(url, function(meta) {
					links.push(meta)
					if (links.length == 3) {
						queryValue = distance(query, snipets);
						return callback(queryValue, links);
					}
				})
			}
	  }
	});
}

var distance = function(query, snipets) {
	var querryTokens = tokenizer = new natural.WordTokenizer().tokenize(query)
	TfIdf = natural.TfIdf,
    tfidf = new TfIdf();
	snipets.forEach(function(snipet){
		tfidf.addDocument(snipet);
	});

	totalSum = 0.0
	querryTokens.forEach(function(token){
		articleSum = 0.0
		tfidf.tfidfs(token, function(i, measure){
			articleSum += measure;
		})
		totalSum += articleSum;
	})
	return totalSum
}

exports.linksUpdate = function() {
	Prediction.allBuriedLinks(function(err, results){
		console.log(results)
		results.forEach(function(prediction){
		googleSearch(prediction.text, function(value, links){
			console.log(links)
			if (value >= prediction.linkScore) {
				value = Math.round(value * 100)/100
				Prediction.update({'_id': prediction['_id']},{$set: {'links': links, 'linkScore': value}}, function(err, res) {

				});
			}
		})
	  })
  })
}
