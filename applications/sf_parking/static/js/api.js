angular.module('get_nearest_parking', []).
factory('GetNearestParking', function($http) {
  var GetNearestParking = {};
  GetNearestParking.get = function(lat, lng, callback) {
    $http.get('api/nearest_api/loc?lat=' + lat+'&lng='+lng).success(function(data, status) {
    	callback(data);
    })
    .error(function(data, status) {
    	callback(data);
	});
  };
  return GetNearestParking;
});