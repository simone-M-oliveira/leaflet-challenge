// url to earthquake dataset; all earthquakes in the last day
var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

// helper function that returns a color in RGB format based on the provided depth
function getColorFromDepth(depth) {
    if (depth < 10) return "rgb(50,255,50)";
    if (depth < 30) return "rgb(157,223,0)";
    if (depth < 50) return "rgb(207,188,0)";
    if (depth < 70) return "rgb(238,148,0)";
    if (depth < 90) return "rgb(254,103,0)";
    return "rgb(255,50,50)";
}

// retrieve the data using D3
// add the map elements after retrieval
d3.json(url).then(data => {

    // create the earthquake map.  Centered on U.S. with a zoom level of 5
    var earthquakeMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5
    });

    // add the tile layer to the earthquake map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(earthquakeMap);

    // add the geoJSON data to the earthquake map
    L.geoJSON(data, {
        // add the points as circle markers to the map;
        // radius = 5 * the magnitude
        // the depth is used to determine the fillColor by calling getColorFromDepth
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 5,
                fillColor: getColorFromDepth(feature.geometry.coordinates[2]),
                color: "black",
                opacity: 1,
                weight: 1,
                fillOpacity: 1

            })
        },
        // for each feature, add a popup that displays
        // the place, latitude & longitude, magnitude, and depth.
        onEachFeature: function(feature, layer) {
            layer.bindPopup(
                `<h4>${feature.properties.place}</h4>
                <b>Coordinates</b>: ${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}<br>
                <b>Magnitude</b>: ${feature.properties.mag}<br>
                <b>Depth</b>: ${feature.geometry.coordinates[2]}`
            )}
    }).addTo(earthquakeMap);

    // create and add the legend to the earthquake map
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend');
        var labels = [];
        var levels = [
            { label: '< 10', value: 9 },
            { label: '10 - 30', value: 29 },
            { label: '30 - 50', value: 49 },
            { label: '50 - 70', value: 69 },
            { label: '70 - 90', value: 89 },
            { label: '> 90', value: 90 }
        ];

        // legend title
        labels.push('<b>Depth</b><br>');

        // legend entries.  Use the above labels and getColorFromDepth function for the indicators
        levels.forEach(level => {
            div.innerHTML += 
                labels.push(
                    '<i style="background:' + getColorFromDepth(level.value) + '"></i> ' + level.label
                );
        });

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(earthquakeMap);
});