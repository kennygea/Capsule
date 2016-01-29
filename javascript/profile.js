$('document').ready(function() {
	$('.menu .item')
  .tab();

  $('.ui.form')
  .form({
    on: 'blur',
    fields: {
      previouspassword: {
        identifier  : 'previouspassword',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your old password'
          }
        ]
      },
      newpassword: {
        identifier  : 'newpassword',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a new password'
          }
        ]
      },
      confirmnewpassword: {
        identifier  : 'confirmnewpassword',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please re-type your new password'
          }
        ]
      }
    }
  })
;
});

var capsuleApp = angular.module('capsule', []);

capsuleApp.directive('feed', function() {
  var feedController = function($window, $scope, $http, $log, $rootScope, predAPI) {
		
	$scope.state = false
	 
    predAPI.getUser().success(function(data, status) {
      $scope.user = data
    })

    $scope.predictions = [];
	
	$scope.setState = function(state) {
      $scope.state = state
      $scope.populateFeed(state)
    }

	$scope.populateFeed = function(state) {
		if (!state) {
		  $http({
			method: 'GET',
			url: '/api/ongoing-predictions'
		  }).then(function successCallback(response) {
			$scope.predictions = response['data']
			//console.log(response['data']);
		  }, function errorCallback(response) {
			$log.log(response)
		  })
		}
		else {
		  $http({
			method: 'GET',
			url: '/api/opened-predictions'
		  }).then(function successCallback(response) {
			$scope.predictions = response['data']
			//console.log(response['data']);
		  }, function errorCallback(response) {
			$log.log(response)
		  })
		}
	}

	$scope.populateFeed();

  }

  return {
    controller: feedController,
    templateUrl: 'angular_templates/myfeed.html'
  }
});

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
    }
  }
})


capsuleApp.directive('prediction', function() {
  var predictionController = function($window, $scope, $http, $log, $rootScope, predAPI) {

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
        $log.log(data)
      })
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
    templateUrl: 'angular_templates/mypredictions.html'
  }
})
