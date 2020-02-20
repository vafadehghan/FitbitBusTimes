/*
 * Entry point for the companion app
 */
import * as messaging from "messaging";
import {
    geolocation
} from "geolocation";

console.log("Companion code started");

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
    // Handle any errors
    console.log("Connection error: " + err.code + " - " + err.message);
}

messaging.peerSocket.onmessage = function(evt) {
    console.log("Companion Received Message");
    console.log(JSON.stringify(evt.data));
    var apiKEY = "YvbQ52MeJxu6IbU1jyof";
    var url = "https://api.translink.ca/rttiapi/v1/stops/" + JSON.stringify(evt.data) + "/estimates?apikey=" + apiKEY + "&count=3&timeframe=120"
    console.log(url);
    fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(function(response) {
        return response.json();
    }).then(function(json) {
        var stopTimes = [];
        let i = 0;
        while (i in json && 'Schedules' in json[i]) {
            let j = 0;
            while (j in json[i]["Schedules"] && 'ExpectedLeaveTime' in json[i]["Schedules"][j]) {
                var time = json[i]["Schedules"][j]["ExpectedLeaveTime"].split(" ");
                stopTimes.push({
                    routeNo: json[i]["RouteNo"],
                    stopTime: time[0]
                })
                j++;
            }
            i++;
        }

        console.log(JSON.stringify(stopTimes));
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
            // Send the data to peer as a message
            console.log("Sending stop Times to device");
            var stopTimesObj = {
                isTimes: true,
                stopTimes: stopTimes
            };
            messaging.peerSocket.send(stopTimesObj);
        }

    });


}

messaging.peerSocket.onopen = function() {
    console.log("Companion Socket Opened");
    getLocation();
}

function getLocation() {
    geolocation.getCurrentPosition(locationSuccess, locationError, {
        timeout: 60 * 1000
    });
}

function locationSuccess(position) {
    var apiKEY = "YvbQ52MeJxu6IbU1jyof";
    var location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    };
    location.latitude = location.latitude.toFixed(6);
    location.longitude = location.longitude.toFixed(6);
    var url = "https://api.translink.ca/rttiapi/v1/stops?apikey=" + apiKEY + "&lat=" + location.latitude + "&long=" + location.longitude
    console.log(url);

    fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(function(response) {
        return response.json();
    }).then(function(json) {
        var stopNumbers = [];
        for (let i = 0; i < 20; i++) {
            if (i in json && 'StopNo' in json[i]) {
                stopNumbers.push(json[i]["StopNo"]);
            }
        }
        console.log(JSON.stringify(stopNumbers));
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
            // Send the data to peer as a message
            console.log("Sending stop numbers to device");
            var stopNumbersObj = {
                isTimes: false,
                stopNumbers: stopNumbers
            };
            messaging.peerSocket.send(stopNumbersObj);
        }

    });


}

function locationError(error) {
    console.log("Error: " + error.code, "Message: " + error.message);
}