angular.module('sf_bike_parking')
.controller('MainViewControl', function($scope, $ionicLoading, $window, GetNearestParking) {
	$scope.parking_markers = [];
	$scope.user_marker = null;
	
	$scope.initialize = function() {
	    var mapOptions = {
		    center: new google.maps.LatLng(37.718951, -122.500339),
		    zoom: 12,
		    mapTypeId: google.maps.MapTypeId.ROADMAP
	    };

	    var map = new google.maps.Map(document.getElementById("map"),
	        mapOptions);
	    
	    $scope.geocoder = new google.maps.Geocoder();

	    google.maps.event.addDomListener(document.getElementById('map'), 'mousedown', function(e) {
	        e.preventDefault();
	        return false;
	    });

	    google.maps.event.addListener(map, 'click', function(e) {
	    	$scope.clearUserMarker();
	        $scope.addUserMarker(e.latLng.lat(), e.latLng.lng());
	        $scope.GetNearestParkings(e.latLng.lat(), e.latLng.lng());
	        return false;
	    });
	
	    $scope.map = map;
	}

	// Initialization callback on document ready
	angular.element(document).ready(function () {
		$scope.initialize();
	    $scope.myLocation();
    });
	
	// Call api and hook up callback
	$scope.GetNearestParkings = function (lat, lng) {
		GetNearestParking.get(lat, lng, $scope.updateNearestsCallback);
	}
	
	// Call back on rest api response
	$scope.updateNearestsCallback = function (data) {
		$scope.clearParkingMarker();
		console.log(data);
		$scope.addParkingMarker(data["COORDINATES"][0], data["COORDINATES"][1]);
	}
  
	// Center On My Location function
	$scope.myLocation = function() {
	    if($scope.map == null) {
	        return;
	    }
	    $scope.loading = $ionicLoading.show({
	        content: 'Getting current location...',
	        showBackdrop: false
	    });
	
	    navigator.geolocation.getCurrentPosition(function(pos) {
		        $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
		        $scope.clearUserMarker();
		        $scope.addUserMarker(pos.coords.latitude, pos.coords.longitude);
		        $scope.GetNearestParkings(pos.coords.latitude, pos.coords.longitude);
		        $scope.loading.hide();
	    	},
		    function(error) {
		        alert('Unable to get location: ' + error.message);
		    }
	    );
	};

	// add a userMarker at given location
	$scope.addUserMarker = function(lat, lng) {
		var myLatlng = new google.maps.LatLng(lat, lng);
		var marker = new google.maps.Marker({
		    position: myLatlng,
		    title:"My Location"
		});
		$scope.user_marker = marker;
		// To add the marker to the map, call setMap();
		marker.setMap($scope.map);
	}
	
	// add a parking marker at given location
	$scope.addParkingMarker = function (lat, lng) {
		//GetNearestParking.get(0, 0, function(data){});
		var myLatlng = new google.maps.LatLng(lat, lng);
		var marker = new google.maps.Marker({
		    position: myLatlng,
		    title:"Bike Parking",
		    icon: 'static/images/bike_parking.jpeg'
		});
		$scope.parking_markers.push(marker);
		
		// To add the marker to the map, call setMap();
		marker.setMap($scope.map);
	}
	
	// clear user marker
	$scope.clearUserMarker = function () {
		if ($scope.user_marker) {
			$scope.user_marker.setMap(null);
			$scope.user_marker = null;
		}
	}
	
	// clear parking marker
	$scope.clearParkingMarker = function () {
		for (index in $scope.parking_markers) {
			$scope.parking_markers[index].setMap(null);
		}
		$scope.parking_markers = []
	}
	
	// search by address:
	$scope.search = function (address) {
		if (address == "" || address == null) {
			return;
		}
		$scope.geocoder.geocode( { 'address': address}, function(results, status) {
		    if (status == google.maps.GeocoderStatus.OK) {
		        $scope.map.setCenter(results[0].geometry.location);
		        $scope.addUserMarker(results[0].geometry.location.lat(), results[0].geometry.location.lng());
		        $scope.GetNearestParkings(results[0].geometry.location.lat(), results[0].geometry.location.lng());
		    } else {
		        alert('Geocode was not successful for the following reason: ' + status);
		    }
	    });
	}
});