//coordinates
let latmin = 4.462111676045692;
let lonmin = -74.39529418945312;
let latmax = 4.807048939114977;
let lonmax = -73.8336181640625;


//Adding the map
let map = L.map('map'),
    realtime = L.realtime(getCustomData, {
        interval: 10 * 1000
    });


    var Thunderforest_Transport = L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=2f9ce19135c54c998af40f6324c17769', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: '2f9ce19135c54c998af40f6324c17769',
        maxZoom: 22
    }).addTo(map);

var polygon = L.polygon([
    [latmin, lonmin],
    [latmin, lonmax],
    [latmax, lonmax],
    [latmax, lonmin]
]);


let Icon = L.icon({
    iconUrl: 'sharpplane.png',
    iconSize: [20, 25],
    popupAnchor: [1, 1],
});

let airplaneIcon = L.icon({
    iconUrl: 'airport.png',
    iconSize: [20, 35],
});

let airport = L.marker([4.70138889, -74.14694444]).setIcon(airplaneIcon).addTo(map);
airport.bindPopup("<b>INTERNATIONAL AIRPORT EL DORADO</b><br>#103-9, Avenida Calle 26, Fontibón, Bogotá.");


realtime.on('update', function (e) {
    map.fitBounds(polygon.getBounds(), {
        maxZoom: 12
    });

    console.log(arguments);

    function PopUpData(Id) {

        let content;
        let feature = e.features[Id];

        content = `<b>Origin: </b>${feature.properties[2]}<br>
        <b>Latitude: </b>${feature.geometry.coordinates[0]}<br>
        <b>Longitude: </b>${feature.geometry.coordinates[1]}<br>
        <b>Altitude: </b>${feature.properties[7]}`
        return content;
    };

    function showMarker(Id){
        let feature = e.features[Id];
        let rotationAngle = feature.properties[10];
        realtime.getLayer(Id).setIcon(Icon).setRotationAngle(rotationAngle).addTo(map);
    }

    function showPopUp(Id) {
        realtime.getLayer(Id).bindPopup(PopUpData(Id));
    };

    function updatePopUp(Id) {
        realtime.getLayer(Id).getPopup().setContent(PopUpData(Id));
    };

    Object.keys(e.enter).forEach(showMarker);
    Object.keys(e.update).forEach(showMarker);
    Object.keys(e.enter).forEach(showPopUp);
    Object.keys(e.enter).forEach(updatePopUp);

});


//Data for real time
function getCustomData(success, error) {
    let url = `https://opensky-network.org/api/states/all?lamin=${latmin}&lomin=${lonmin}&lamax=${latmax}&lomax=${lonmax}`; //url of service
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function () {
        if (xhr.status === 200) {
            var res = convertToGeoJSON(xhr.responseText);
            success(res);
        } else {
            var e = new Error("HTTP Rquest")
            error(e, xhr.status);
        }
    };
    xhr.send();

    function convertToGeoJSON(input) {
        //convert input to Object, if it is of type string
        if (typeof (input) == "string") {
            input = JSON.parse(input);
        }

        var fs = {
            "type": "FeatureCollection",
            "features": []
        };
        for (var i = 0; i < input.states.length; i++) {
            var ele = input.states[i];
            var feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [ele[5], ele[6]]
                }
            };
            feature.properties = ele;
            //set the id
            feature.properties["id"] = i;

            //check that the elements are numeric and only then insert
            if (isNumeric(ele[5]) && isNumeric(ele[6])) {
                //add this feature to the features array
                fs.features.push(feature)
            }
        }
        //return the GeoJSON FeatureCollection
        return fs;
    }

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

}