var main = function() {
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: {lat: 41.645785, lng: -93.673667},
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
    });
    infowindow = new google.maps.InfoWindow({
		content: "holding..."
	});

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();

      if (places.length === 0) {
        return;
      }

      // Clear out the old markers.
      markers.forEach(function(marker) {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();
      
      var county;
      var fullAddress = '';
      var addressToUse = '';
      
      places.forEach(function(place) {
    	var lastName = '';
      	$.post("addressLookup", {address: place.name}, function (response) {
      		if (response.result.length > 0) {
      			var innerHtml = buildInnerHtml(response);
	            markers.push(new google.maps.Marker({
	                map: map,
	                title: place.name,
	                position: place.geometry.location,
	                html: innerHtml
	              }));
	            markers[0].addListener('click', function () {
					infowindow.setContent(markers[0].html);
					infowindow.open(map, markers[0]);
				});
      		}
        });
      	var geocoder = new google.maps.Geocoder();
      	google.maps.event.addListener(map, 'click', function(event) {
      	  geocoder.geocode({
      	    'latLng': event.latLng
      	  }, function(results, status) {
      	    if (status === google.maps.GeocoderStatus.OK) {
      	      if (results[0]) {
      	    	  var clickedAddress = results[0].address_components[0].short_name + ' ' + results[0].address_components[1].short_name;
      	    	  $.post("addressLookup", {address: clickedAddress}, function (response) {
      	    		  if (response.result.length > 0) {
      	      			var innerHtml = buildInnerHtml(response);
	      	    		markers.push(new google.maps.Marker({
	      	                map: map,
	      	                title: clickedAddress,
	      	                position: results[0].geometry.location,
	      	                html: innerHtml
	      	              }));
	      	    		var i = markers.length;
	      	            markers[i-1].addListener('click', function () {
	      					infowindow.setContent(markers[i-1].html);
	      					infowindow.open(map, markers[i-1]);
	      				});
      	    		  }
	      	    	  });
      	      }
      	    }
      	  });
      	});
      	var addressComponents = place.address_components;
      		addressComponents.some(function(addressComponent) {
      			if (addressComponent.long_name.includes('County')) {
      				county = addressComponent.long_name;
      				return true;
      			}
      		});
        var icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };
        var input = document.getElementById('pac-input');		
        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
	});
}

function buildInnerHtml(response) {
	var innerHtml = '<table>';
	innerHtml += '<div> Full Address: ' + response.result[0].full_street + '</div>';
	if ($('#th1Checkbox').is(':checked')) {
			innerHtml += '<div> Title Holder 1: ' + response.result[0].fname_th1 + ' ' +
				response.result[0].lname_th1 + '</div>';
	}
	if ($('#th2Checkbox').is(':checked')) {
		innerHtml += '<div> Title Holder 2: ' + response.result[0].fname_th2 + ' ' +
			response.result[0].lname_th2 + '</div>';
	}
	if ($('#bedroomsCheckbox').is(':checked')) {
		innerHtml += '<div> Bedrooms: ' + response.result[0].bedrooms + '</div>';
	}
	if ($('#bathroomsCheckbox').is(':checked')) {
		innerHtml += '<div> Bathrooms: ' + response.result[0].bathrooms + '</div>';
	}
	if ($('#tsfCheckbox').is(':checked')) {
		innerHtml += '<div> Total Square Feet Living Area: ' + response.result[0].total_living_area + '</div>';
	}
	if ($('#lotSizeCheckbox').is(':checked')) {
		innerHtml += '<div> Lot Size: ' + response.result[0].land_sf + ' Square Feet <br>' + 
		response.result[0].land_acres + ' Acres </div>';
	}
	if ($('#yearBuiltCheckbox').is(':checked')) {
		innerHtml += '<div> Year Built: ' + response.result[0].year_built + '</div>';
	}
	if ($('#titleTransferCheckbox').is(':checked')) {
		innerHtml += '<div> Most recent title transfer: ' + response.result[0].transfer_th1 + '</div>';
	}
	innerHtml += '</table>';
	return innerHtml;
}

$(document).ready(main);