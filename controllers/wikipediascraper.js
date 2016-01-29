//Functional, but not currently in use

var cheerio = require('cheerio')
var wikipedia = require('node-wikipedia')
var kwxt = require('keyword-extractor')
var scm = require('string-case-match')

function looseSearch(bigString, littleString) {
  var importantWords = kwxt.extract(littleString, {
    language: 'english',
    remove_digits: true,
    remove_duplicates: true
  });

  var importantPhrase = kwxt.extract(bigString, {
    language: 'english',
    remove_digits: true,
    remove_duplicates: true
  }).join(" ");

  matcher = new scm([importantPhrase])
  var score = 0;
  for (var i = 0; i < importantWords.length; i++) {
    if (matcher.matches(importantWords[i]).length > 0) {
      score += 1
    }
  }
  return score
}

exports.scrape = function(monthsLocked, searchTerm) {
  var wiki_articles = [moment().year().toString() + '_in_the_United_States']
  if (moment().subtract(monthsLocked, 'months').year() != moment().year()) {
    wiki_articles.push(moment().subtract(monthsLocked, 'months').year() + '_in_the_United_States')
  }
  var maxScore = 0
  var maxText = null
  maxURL = ""
  flag = 0
  for (var i = 0; i < wiki_articles.length; i++) {
    wikipedia.page.data(wiki_articles[i], {content: true}, function(response) {
      $ = cheerio.load(response['text']['*'])
      lists = $('li:not(:has(li))')
      scores = []
      $(lists).each(function(i, link){
        var text = $(link).text()
        var potentialText = $(link).parentsUntil('li>:has(a)').children('a').text()
        if (moment(text.split('–')[0], "MMM DD").isValid() || moment(potentialText, "MMM DD").isValid()) {
          score = looseSearch(text, searchTerm)
          if (score > maxScore) {
            maxScore = score
            maxText = text
          }
        }
      });
      // Found the maximum text for this search --- Find the correcsponding citation
      if (maxText) {
        var trycitation = maxText.split('[')
        if (trycitation.length == 1) {
          console.log("NO CITATION :(");
        }
        else {
          citation = trycitation[trycitation.length - 1].slice(0, -1) // Citation number
          link = $('li#cite_note-' + citation + ' a.external')
          maxURL = link.attr('href')
          if (flag == wiki_articles.length-1)
            console.log(maxURL)
        }
      }
      flag += 1
    })
  }
}
