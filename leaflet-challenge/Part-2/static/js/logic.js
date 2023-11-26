// url to earthquake dataset; all earthquakes in the last day
var earthquake_url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

// path to local techtonic boundary data
var techtonic_data = 'static/data/PB2002_boundaries.json'

// helper function that returns a color in RGB format based on the provided depth
function getColorFromDepth(depth) {
    if (depth < 10) return "rgb(50,255,50)";
    if (depth < 30) return "rgb(157,223,0)";
    if (depth < 50) return "rgb(207,188,0)";
    if (depth < 70) return "rgb(238,148,0)";
    if (depth < 90) return "rgb(254,103,0)";
    return "rgb(255,50,50)";
}

// retrieve the earthquake data using D3
d3.json(earthquake_url).then(earthquakeData => {

    // retrieve the techtonic plage data using D3
    d3.json(techtonic_data).then(techtonic_data => {
        
        // add the base tile layers to the earthquake map
        // street map
        var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        // topographic map
        var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });

        // gray map
        var gray = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
        });

        // add the geoJSON earthquake data to the map
        var earthquakes = L.geoJSON(earthquakeData, {
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
        });

        // add the geoJSON techtonic boundary data to the map
        var techtonic_boundaries = L.geoJSON(techtonic_data, {
            style: {
                color: "orange",
                weight: 5
            }
        });

        // set the map options
        var baseMaps = {
            "Street Map": street,
            "Topography Map": topo,
            "Gray Map": gray
        };

        // set the overlay options
        var overlayMaps = {
            "Earthquakes": earthquakes,
            "Techtonic Boundaries": techtonic_boundaries
        };

        // create the earthquake map.  Centered on U.S. with a zoom level of 5
        // default the layers to the street map and earthquake data
        var earthquakeMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 5,
            layers: [street, earthquakes]
        });

        // add the layers to the map
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
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
});