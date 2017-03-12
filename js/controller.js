var MyApp = angular.module("App",['zingchart-angularjs','uiGmapgoogle-maps']);


	
MyApp.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyAKw3oUhX4EqhXPmL9jJ9YY4GagTP9s_iU',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});

MyApp.controller('MyCtrl', function($scope,$http) {
	var geoapi_key = "AqbfQgdDj0oHogXKLAAG1dTzQzsTzNGH";
	var aqi_key = "9cae124c36084af393570f8f6cf7ebd8";

	$scope.avaiablecities = ["Mexico City","Los Angeles", "Toronto", "Frankfurt", "Milan", "Mumbai", "Chicago", "Paris", "Beijing","Dubai","Sydney","Singapore","Hong Kong","Tokyo","New York","London","Amsterdam","Kuala Lumpur","Brussels","New Delhi","Johannesburg","Others"];
	$scope.avaiableperiod = ["Past Three Days", "Past One Week","Past Ten Days","Past Two Weeks"];
	//$scope.geo_responsestatus = "none";

// add google map scope variable	

	$scope.map = { center: 
					{ 
					latitude: null, 
					longitude: null
					}, 
					zoom: 1 
			};
	
	$scope.marker = {
      id: 0,
      coords: {
        latitude: 150,
        longitude: 150
      }	
	}

//the scope object for zingchart ;
	$scope.myJson = {
		title : {
			text : "History Air Quality Index ",
			fontSize : 16,
			fontColor : "#fff"
			},
		backgroundColor: "#2bbb9a",
		globals: {
			shadow: false,
			fontFamily: "Arial"
			},
		type: "line",
		scaleX: {
			"min-value": null,
			"step": "day",
			"transform" : {
				"type": "date",
				"all": "%m.%d.%y"
				},
			maxItems: 8,
			lineColor: "white",
			lineWidth: "1px",
			tick: {
					lineColor: "white",
					lineWidth: "1px"
				},
			item: {
					fontColor: "white"
				},
			guide: {
					visible: false
					}
		},
		scaleY: {
			lineColor: "white",
			lineWidth: "1px",
			tick: {
				lineColor: "white",
				lineWidth: "1px"
				},
			guide: {
				lineStyle: "solid",
				lineColor: "#249178"
				},
			item: {
				fontColor: "white"
				},
		},
		tooltip: {
			visible: false
			},
		crosshairX: {
			lineColor: "#fff",
			scaleLabel: {
				backgroundColor: "#fff",
				fontColor: "#323232"
			},
			plotLabel: {
				backgroundColor: "#00ACF2",
				fontColor: "white",
				borderColor: "transparent"
			}
		},
		plot: {
			lineWidth: "2px",
			lineColor: "#FFF",
			aspect: "spline",
			marker: {
				visible: true,
				backgroundColor : "white",
				borderWidth : "2px",
			},
			hoverMarker : {
				backgroundColor : 'none',
				size : 10
			}
		},
		series: [{
			values: null,
			text: "AQI"
			}]
	}		
//// the scope data for zc-render attribute////
	$scope.myRender = {
		events : {
			node_mouseover: function(p) {
						console.log(p["nodeindex"]);
						$scope.DateIndex = p["nodeindex"];
						updateCurrentDate();
					}
				}	
	}; 

////////////////////////////////////////////////////////
//// the method called by clicking the get data button//				
	$scope.clickSendRequest = function() {
		// send geocoding request to the API 

		console.log($scope.selectedCity);
		if ($scope.selectedCity == "Others") {
			//console.log($scope.searchedCity);
			$scope.targetCity = $scope.searchedCity;
		} else {
			//console.log($scope.selectedCity);
			$scope.targetCity = $scope.selectedCity;
		}
		var geo_url = "http://www.mapquestapi.com/geocoding/v1/address" + "?" + "key=" + geoapi_key + "&" + "city=" + $scope.targetCity;
		console.log(geo_url);
		$http({
		method : "GET",
		url : geo_url
		}).then(    
			function mySuccess(response) {
				//console.log(response.statusText);
				$scope.geo_responsestatus = response.statusText;
				var res = response.data
					$scope.lat = res['results'][0]['locations'][0]['displayLatLng']['lat'];
					$scope.lon = res['results'][0]['locations'][0]['displayLatLng']['lng'];						
					$scope.map.center.latitude = $scope.lat;
					$scope.map.center.longitude = $scope.lon;
					$scope.map.zoom = 4;
					$scope.marker.coords.latitude = $scope.lat;
				    $scope.marker.coords.longitude = $scope.lon;
				//console.log($scope.lat , $scope.lon );
				if ($scope.geo_responsestatus == "OK") {
					if ($scope.selectedperiod) {
						historyDataQuery();
					}
					currentDataQuery();
				}	
			},
			function myError(response) {
				console.log("Something wrong for geo API");
			}
		);
		
	};
//////////////////////////////////////////////////////////
//// the method called to get the history API data////
	var historyDataQuery = function() {
		var period_day = 0;
		switch ($scope.selectedperiod) {
			case "Past Three Days":
				period_day = 3;
				break;
			case "Past One Week":
				period_day = 7;
				break;
			case "Past Ten Days":
				period_day = 10;
				break;
			case "Past Two Weeks":
				period_day = 14;
				break;
			}
		var d = new Date();
		var enddate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" +  d.getDate() + "T" + "12:00:00";
		console.log(enddate);
		console.log(Date.parse(d.toDateString()));
		
		d.setDate(d.getDate() - period_day)
		var startdate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" +  d.getDate() + "T" + "12:00:00";
		var startdate_ms = Date.parse(d.toDateString());
		console.log(startdate);
		console.log("startdate:" + startdate_ms + typeof(startdate_ms));
		
		var aqi_history_url = "http://api.breezometer.com/baqi/" + "?" + "start_datetime=" + startdate + "&" + "end_datetime=" + enddate + "&" + "interval=24" + "&" + "lat="  +  $scope.lat + "&" + "lon=" + $scope.lon + "&" + "key=" + aqi_key;
		console.log(aqi_history_url)
		$http({
			method: "GET",
			url : aqi_history_url
		}).then(
			function mySuccess(response) {
				console.log(Object.keys(response));
				var res= response.data;
				$scope.allHistoryData = res;
				var historydata = [];
				console.log(typeof(res));
				for (eachindex in res) {
					console.log(res[eachindex]);
					historydata.push(res[eachindex]["breezometer_aqi"]);
				}
				$scope.myJson.scaleX["min-value"] = startdate_ms;
				$scope.myJson.series[0].values = historydata;
				

			

			},
			function myError(response) {
				console.log("Something wrong for AQI History API");
			}
		);
	}
	
//////////////////////////////////////////////////////////
//// update the detail data panel by clicking the point on history plot////
	var updateCurrentDate = function() {
		var updateDateIndex = $scope.DateIndex;
		updatedCurrentResult = $scope.allHistoryData[updateDateIndex];
		console.log(updatedCurrentResult)
		//scope apply to update scope data
		$scope.$apply(function() {
			$scope.cityIndex = updatedCurrentResult["breezometer_aqi"];
			$scope.recommendation = {
				"health": "Health: " + updatedCurrentResult["random_recommendations"]["health"],
				"children": "Children: " + updatedCurrentResult["random_recommendations"]["children"],
				"sport": "Sport: " + updatedCurrentResult["random_recommendations"]["sport"]		
			};
			$scope.pollution = {
				"dominant_pollutant" : "Dominant Pollution: " + updatedCurrentResult["dominant_pollutant_canonical_name"] + ", " + updatedCurrentResult["dominant_pollutant_description"],
				"effect": "Effect: " + updatedCurrentResult["dominant_pollutant_text"]["effects"]		
			};
			$scope.datetime = updatedCurrentResult["datetime"].split("T")[0];
			updateScope();
		});

	}
	
//////////////////////////////////////////////////////////
//// the method called to get the current API data////
	var currentDataQuery = function() {

		var api_url = "http://api.breezometer.com/baqi/" + "?" + "lat=" + $scope.lat + "&" + "lon=" + $scope.lon + "&" + "key=" + aqi_key;
		console.log(api_url);
		$http({
			method : "GET",
			url : api_url
		}).then(
			function mySuccess(response) {
				$scope.aqi_status = response.statusText
				var res = response.data;
				$scope.country_name = res["country_name"];
				$scope.cityIndex = res["breezometer_aqi"];
				$scope.cityDescription = res["breezometer_description"];
				//$scope.recommendation = res["random_recommendations"]["sport"];
				$scope.recommendation = {
					"health": "Health: " + res["random_recommendations"]["health"],
					"children": "Children: " + res["random_recommendations"]["children"],
					"sport": "Sport: " + res["random_recommendations"]["sport"]
				};
				$scope.pollution = {
					"dominant_pollutant" : "Dominant Pollution: " + res["dominant_pollutant_canonical_name"] + ", " + res["dominant_pollutant_description"],
					"effect": "Effect: " + res["dominant_pollutant_text"]["effects"]										
				};
				$scope.datetime = res["datetime"].split("T")[0];
				console.log($scope.recommendation)	
				updateScope();
			},
			function myError(response) {
				console.log("Something wrong for AQI API");
			}
			);
	}
//////////////////////////////////////////////////////////
//// the method called to update the scope data////
	var updateScope = function() {
		$scope.tableTypeRow1 = "";
		$scope.tableTypeRow2 = "";
		$scope.tableTypeRow3 = "";
		$scope.tableTypeRow4 = "";
		$scope.tableTypeRow5 = "";
		if ($scope.cityIndex > 80) {
			$scope.tableTypeRow1 = "success";
			$scope.labelType = "label label-success";
			$scope.contextualType = "list-group-item-success";
		} else if ($scope.cityIndex > 60) {
			$scope.tableTypeRow2 = "info";
			$scope.labelType = "label label-info";
			$scope.contextualType = "list-group-item-info";
		} else if ($scope.cityIndex > 40) {
			$scope.tableTypeRow3 = "warning";
			$scope.labelType = "label label-warning";
			$scope.contextualType = "list-group-item-warning";
		} else if ($scope.cityIndex > 20) {
			$scope.tableTypeRow4 = "danger";
			$scope.labelType = "label label-danger";
			$scope.contextualType = "list-group-item-danger";
		} else {
			$scope.tableTypeRow5 = "active";
			$scope.labelType = "label label-active";
			$scope.contextualType = "list-group-item-active";
		}
		$scope.selectedShow = true;
		
		console.log($scope.cityIndex)
	}


})


