function deleteItem(arr, item) {
  var i = arr.indexOf(item);
  if(i != -1) {
  	arr.splice(i, 1);
  }
  return arr
}

var capsuleApp = angular.module('capsule', ['ngSanitize']);

capsuleApp.controller('post-ctrl', function($scope, $http, $rootScope, $log) {
  $scope.hashtags = []
  $scope.err = ""
  $scope.text = ""

  $scope.removeHashtag = function(hashText) {
    $scope.hashtags = deleteItem($scope.hashtags, hashText)
  }

  $scope.newPost = function() {
    if (!($scope.text && ($scope.text).trim().length != 0 && $scope.hashtags.length != 0 && $scope.text.length < 51)) {
      $scope.err = "<ul>"
      if ((!$scope.text) || ($scope.text).trim().length == 0) $scope.err += "<li> Please enter prediction text </li>"
      if ($scope.hashtags.length == 0) $scope.err += "<li> Please enter some hashtags </li>"
      if ($scope.text.length > 50) $scope.err += "<li> Prediction is too long</li>"
      $scope.err += "</ul>"
    }
    else {
      $http({
        method: 'POST',
        url: '/api/predictions',
        data: {
          text: $scope.text,
          hashtags: $scope.hashtags
        }
      }).success(function(response) {
        if (response == "exists") {$scope.err += "<li>This prediction already exists</li>"}
        else {
          $scope.err = null
        }
        $rootScope.refreshFeed()
      })
      $scope.text = ""
      $scope.hashtags = []
    }
  }

  $scope.newHashtag = function() {
    if($scope.hashtags.indexOf($scope.hashtag) == -1 && $scope.hashtag != "" && $scope.hashtag != undefined
          && $scope.hashtags.length < 10) {
      $scope.hashtags.push($scope.hashtag)
    }
    $scope.hashtag = "";
  }

  $scope.bringBack = function() {
    if ($scope.hashtag === "") $scope.hashtag = $scope.hashtags.pop()
    else return false
    return true
  }

  $scope.formatTime = function() {
    var momInQ = moment().endOf('minute').clone()
    var diff = momInQ.diff(moment())
    if (diff < 10000) {
      return "in a few seconds"
    } else if (diff < 15000) {
      return "in about 15 seconds"
    } else if (diff < 30000) {
      return "in less than 30 seconds"
    } else if (diff < 45000) {
      return "in less than 45 seconds"
    } else if (diff < 60000) {
      return "in about a minute"
    } else {
      return momInQ.fromNow()
    }
  }

})

capsuleApp.directive('feed', function() {
  var feedController = function($window, $scope, $interval, $http, $log, predAPI) {

    $scope.state = true

    predAPI.getUser().success(function(data, status) {
      $scope.user = data
      $log.log($scope.user)
      if (!$scope.user.verified) {
        $('.ui.first.modal').modal('show')
        predAPI.verifyUser().success(function(data, status) {
          $scope.refreshUser()
        })
      }
    })

    $scope.setState = function(state) {
      $scope.state = state
      $scope.refreshFeed()
    }

    $scope.predictions = []
    $scope.refreshUser = function() {
      predAPI.getUser().success(function(data, status) {
        $scope.user = data
        console.log($scope.user)
      })
    }

    $scope.refreshFeed = function() {
      $http({
        method: 'GET',
        url: '/api/predictions/' + ($scope.state ? 1 : 0)*2
      }).then(function successCallback(response) {	
		  
		response['data'].sort(function(a,b) {
			aScore = a.upvotes - a.downvotes;
			bScore = b.upvotes - b.downvotes;
			
			if (aScore > bScore) {
				return -1
			}
			if(aScore < bScore) {
				return 1
			}
			return 0
		}); 
        $scope.predictions = response['data']
		
		
		
      }, function errorCallback(response) {
        $log.log(response)
      })
    }

    $interval($scope.refreshFeed, 10000)
    $scope.refreshFeed()
  }

  return {
    controller: feedController,
    templateUrl: 'angular_templates/feed.html'
  }
});


capsuleApp.directive('prediction', function() {
  var predictionController = function($window, $scope, $http, $log, $rootScope, predAPI) {

    $scope.getImage = function(imageURL, url) {
      if (url) {
        if (imageURL) return imageURL
        else return "/logo/" + url.split("://")[1].split('.')[0] + '.png'
      }
    }

    $scope.formatDate = function() {
      if (moment($scope.pred.planDates[1]).isAfter(moment())) {
        return "Posted " + moment($scope.pred.posted).fromNow()
      } else {
        return "Uncovered " + moment($scope.pred.planDates[1]).fromNow()
      }
    }

    $scope.refreshSelf = function () {
      predAPI.getPrediction($scope.pred['_id']).success(function(data, status) {
        $scope.pred = data[0]
		$scope.getHashtags()
        $log.log(data)
      })
    }


    $scope.upvote = function () {
      $http({
        method: 'POST',
        url: '/api/upvote',
        data: {
          predid: $scope.pred['_id']
        }
      }).then(function successCallback(response) {
        $scope.$parent.refreshUser()
        $scope.refreshSelf()
      }, function errorCallback(response) {
        $log.log(response)
      })
    }

    $scope.downvote = function () {
      $http({
        method: 'POST',
        url: '/api/downvote',
        data: {
          predid: $scope.pred['_id']
        }
      }).then(function successCallback(response) {
        $scope.$parent.refreshUser()
        $scope.refreshSelf()
      }, function errorCallback(response) {
        $log.log(response)
      })
    }

    $scope.repredict = function () {
      $http({
        method: 'POST',
        url: '/api/repredict',
        data: {
          predid: $scope.pred['_id']
        }
      }).then(function successCallback(response) {
        $scope.$parent.refreshUser()
        $scope.refreshSelf()
      }, function errorCallback(response) {
        $log.log(response)
      })
    }

    $scope.didRepredict = function() {
      var repredicts = $rootScope.user.repredicts
      $log.log(repredicts.indexOf($scope.pred['_id']))
      if (repredicts.indexOf($scope.pred['_id'])  == -1) { return false; }
      return true;
    }

    $scope.didUpvote = function () {
      var upvotes = $rootScope.user.upvotes
      if (upvotes.indexOf($scope.pred['_id']) == -1) { return false; }
      return true;
    }

    $scope.didDownvote = function () {
      var downvotes = $rootScope.user.downvotes
      if (downvotes.indexOf($scope.pred['_id']) == -1) { return false; }
      return true;
    }

  	$scope.getHashtags = function() {
  		var hashtagArray = $scope.pred.hashtags
  		var hashtagString = ""
  		i = 0;
  		hashtagArray.forEach(function(hashtag) {
  			i += 1;
        if (!(hashtag.substring(0, 1) === "#")) hashtagString += "#"
  			hashtagString += hashtag;
  			if (i < hashtagArray.length) hashtagString += " "
  		})
  		return hashtagString
  	}
  }
  return {
    controller: predictionController,
    templateUrl: 'angular_templates/prediction.html'
  }
})

capsuleApp.factory('predAPI', function($http, $log) {
  return {
    getUser: function() {
      return $http({
        method: 'GET',
        url: '/api/user'
      })
    },
    getPrediction: function(id) {
      return $http({
        method: 'GET',
        url: '/api/prediction/' + id
      })
    },
    verifyUser: function() {
      return $http({
        method: 'POST',
        url: '/api/verify'
      })
    }
  }
})

capsuleApp.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});

capsuleApp.directive('ngSpace', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which == 32) {
        scope.$apply(function (){
          scope.$eval(attrs.ngSpace);
        });
        event.preventDefault();
      }
    });
  };
});

capsuleApp.directive('ngDelete', function () {
  return function (scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which == 46 || event.which == 8) {
        scope.$apply(function() {
          if (scope.$eval(attrs.ngDelete)) event.preventDefault();
        });
      }
    })
  }
})
