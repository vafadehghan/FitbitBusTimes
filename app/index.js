/*
 * Entry point for the watch app
 */
import document from "document";
import * as messaging from "messaging";



messaging.peerSocket.onopen = function() {
    console.log("Device Socket Opened");
}
// Listen for the onmessage event


messaging.peerSocket.onmessage = function(evt) {
    // Output the message to the console
    console.log("Device Received Message");
    console.log(JSON.stringify(evt.data));
    if (evt.data.isTimes) {
        console.log("Device received times");
        updateBusTimesUI(evt.data.stopTimes);
    } else {
        updateBusNoUI(evt.data.stopNumbers);
    }
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
    // Handle any errors
    console.log("Connection error: " + err.code + " - " + err.message);
}

function updateBusTimesUI(data) {
    console.log(JSON.stringify(data));
    var tiles = [];
    for (let i = 0; i < 20; i++) {
        let tile = document.getElementById(`train-${i}`);
        if (tile) {
            tile.getElementById("busNumber").text = "";
            tiles.push(tile);
        }
    }
    for (let i = 0; i < data.length; i++) {
        let tile = tiles[i];
        if (!tile) {
            continue;
        }

        tile.style.display = "inline";
        tile.getElementById("busNumber").text = "Bus #" + data[i].routeNo;
        tile.getElementById("minutes").text = "Arriving: " + data[i].stopTime;
        document.getElementById("trainList").value = 0;

    }
}

function updateBusNoUI(data) {
    var tiles = [];
    for (let i = 0; i < 20; i++) {
        let tile = document.getElementById(`train-${i}`);
        if (tile) {
            tiles.push(tile);
        }
    }
    for (let i = 0; i < data.length; i++) {
        let tile = tiles[i];
        if (!tile) {
            continue;
        }

        tile.style.display = "inline";
        tile.getElementById("busNumber").text = "Stop #" + data[i];

    }

    let list = document.getElementById("trainList");
    let items = list.getElementsByClassName("item");

    items.forEach((element, index) => {
        let touch = element.getElementById("touch-me");
        touch.onclick = (evt) => {
            console.log('touched: ' + data[index]);
            if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
                // Send the data to peer as a message
                console.log("Sending stop number to Companion");
                messaging.peerSocket.send(data[index]);
            }

        }
    });

}