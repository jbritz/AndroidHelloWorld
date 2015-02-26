(function() {
    $(document).ready(function() {
    
        // Make your jQuery Mobile framework configuration changes here!
        $.mobile.allowCrossDomainPages = true;
        $.support.cors = true;

        $('#start-patrol-btn').click(function() {
			alert("Hello");
        });

        $('#linkStreetLights').click(function() {
		try {
            resfreshStreetLightPosition();
			}
			catch(err) {
				alert(err.message);
			}
        });

        $('#streetLightStreetNameLabel').click(function() {
            resfreshStreetLightPosition();
        });

        $('#btnAddPole').click(function() {
            addLightPoleField();
        });

        $('#btn-submit-street-light').click(function() {
            /* stop form from submitting normally */
            event.preventDefault();            
            submitStreeLights();
        });
    });

    function resfreshStreetLightPosition() {
        updateStreetLightStreetName("Finding street...");
        getCurrentStreetOnly(updateStreetLightStreetName);
    }

    function updateCurrentLocation() {
        setCurrentLocationText("Finding location");
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }

    var onSuccess = function(position) {
        getStreetAddress(position.coords.latitude, position.coords.longitude);
        SubmitPosition(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
    };

    function onError(error) {
        alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
    };

    function setCurrentLocationText(message) {
        $('#currentLocation').val(message);
    };

    function updateStreetLightStreetName(streetname) {
        $('#streetLightStreetName').val(streetname);
    };

    function getStreetAddress(lat, lon) {
        var geocoder = new google.maps.Geocoder();
        var latLng = new google.maps.LatLng(lat, lon);

        if (geocoder) {
            geocoder.geocode({
                'latLng': latLng
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    setCurrentLocationText(results[0].formatted_address);
                } else {
                    setCurrentLocationText("Geocoding failed: " + status);
                }
            });
        }
    };

    function SubmitPosition(lat, lon, accuracy) {
        ///var data = { latitude: lat, longitude: lon, accuracy:accuracy };
        //var data = { latitude: "test"};
        var data = JSON.stringify({
            latitude: lat,
            longitude: lon,
            accuracy: accuracy
        });
        //'data' is much more complicated in my real application
        // var jsonOfLog = JSON.stringify(data);

        $.ajax({
            type: 'POST',
            url: "http://ls1patroller.azurewebsites.net/Patrol/SubmitPosition",
            data: data,
            contentType: "application/json",
            dataType: 'json',
            success: function(returnPayload) {
                console && console.log("request succeeded");
            },
            error: function(xhr, errorType, exception) {
                console && console.log("request failed");
                var errorMessage = exception || xhr.statusText; //If exception null, then default to xhr.statusText  

            }
        });
    };


    function submitStreeLights() {
        //get the data needed
        var streetName = $("#streetLightStreetName").val();
        var streetLightNumbers = getSteetLightNumbers();

        //Send the data to the server
        sendStreetLightData(streetName, streetLightNumbers);
    };

    function resetStreetLightForm() {
        $("#pole-list input[type=number]").each(function() {
            if (this.name != "field0") {
                $(this).parent().prev().remove();
                $(this).parent().remove();
            }
        });

        $('#field0 input').val('');
        $('#field0').val('');
        $('#field0').attr('value', '');
        resfreshStreetLightPosition();
    }

    function getSteetLightNumbers() {
        var itemList = new Array();
        $("#pole-list input[type=number]").each(function() {
            if (isNumber(this.value)) {
                itemList.push(this.value);
            }
        });
        return itemList;
    };

    function sendStreetLightData(streetName, numberList) {
        ///var data = { latitude: lat, longitude: lon, accuracy:accuracy };
        //var data = { latitude: "test"};
        var data = JSON.stringify({
            streetName: streetName,
            poleNumbers: numberList,
        });
        //'data' is much more complicated in my real application
        // var jsonOfLog = JSON.stringify(data);

        $.ajax({
            type: 'POST',
            url: "http://ls1patroller.azurewebsites.net/Patrol/SubmitStreetLightProblems",
            data: data,
            contentType: "application/json",
            dataType: 'json',
            success: function(returnPayload) {
                console && console.log("request succeeded");
                resetStreetLightForm();
            },
            error: function(xhr, errorType, exception) {

                if (xhr.status == 200) {
                    resetStreetLightForm();
                    return;
                }

                console && console.log("request failed");
                var errorMessage = exception || xhr.statusText; //If exception null, then default to xhr.statusText  
            }
        });
    };

    $(document).ajaxError(function(e, request, errorThrown, exception) {
        if (request.status == 200)
            return;

        var message = "errorThrown: " + errorThrown + ", exception: " + exception;
        alert(request.status);
    });

    function getStreetOnly(lat, lon, successCallBack) {
        var geocoder = new google.maps.Geocoder();
        var latLng = new google.maps.LatLng(lat, lon);

        if (geocoder) {
            geocoder.geocode({
                'latLng': latLng
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    successCallBack(results[0].address_components[1].long_name);
                } else {
                    successCallBack("Geocoding failed: " + status);
                }
            });
        }
    }

    function getCurrentStreetOnly(callback) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                getStreetOnly(position.coords.latitude, position.coords.longitude, callback);
            }, onError);
    };


    function addLightPoleField() {
        var next = $('input#poleCount').val();
        var addto = "#floorElement"
        next = next + 1;
        var newIn = '<label></label><div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><input autocomplete="off" id="field' + next + '" name="field' + next + '" type="number" /></div>';
        var newInput = $(newIn);
        console.log(addto);
        $(addto).before(newInput);
        $("#count").val(next);
    };

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
    
    

})();