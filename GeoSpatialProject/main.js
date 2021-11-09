// getting data straight from USGS, this way it should stay up to date? Saw that a lot of people were using it this way so I will too.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(earthquakeData) {
  features(earthquakeData.features);
});

function markerSize(magnitude) {
  return magnitude * 30000;
};

// Colors as magnitude
function getColor(m) {

  var colors = ['#7cfc00','#a7cc00','#b69c00','#b56c00','#a63d00','#8b0000'];

  return  m > 5? colors[5]:
          m > 4? colors[4]:
          m > 3? colors[3]:
          m > 2? colors[2]:
          m > 1? colors[1]:
                 colors[0];
};

// Colors found using: https://learnui.design/tools/data-color-picker.html

// #7cfc00
// #a7cc00
// #b69c00
// #b56c00
// #a63d00
// #8b0000


//Creating the features source: 
// https://stackoverflow.com/questions/26241377/opening-a-leaflet-popup-on-a-layergroup
// https://geekswithlatitude.readme.io/docs/leaflet-map-with-geojson-popups
// https://www.youtube.com/watch?v=nZaZ2dB6pow&t=275s
// https://www.youtube.com/watch?v=r94kI6my0QQ&t=742s
// https://www.youtube.com/watch?v=OYjFR_CGV8o

function features(earthquakeData) {

  var earthquakes = L.geoJSON(earthquakeData,{
    onEachFeature: function(feature, layer){
      layer.bindPopup("<h3 > This particular earthquake has a magnitude of "+ feature.properties.mag +', '+
      "and it's Location is  " + feature.properties.place +
      "</h3><hr><h3> It occurred on " + new Date(feature.properties.time) + "</h3>" );
    },

    pointToLayer: function(feature, latlng){
      return new L.circle(latlng,
      { radius: markerSize(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .8,
        color: 'grey',
        weight: .5
      })
    }    
  });

  createMap(earthquakes);
};  
  
//Setting up the maps and have layers
// https://leafletjs.com/examples/layers-control/

function createMap(earthquakes) {

  let lightmap = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  maxZoom: 6
});
  let topography = OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
  let satellitemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

  // Saw someone using tectonic plates and thought it would be a cool addition
  // https://github.com/fraxen/tectonicplates
  // https://joekell.github.io/leaflet_map/
  var tectonicPlates = new L.LayerGroup();
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function (plateData) {
    L.geoJSON(plateData,
      {
        color: 'orange',
        weight: 2
      })
      .addTo(tectonicPlates);
  });    

  var baseMaps = {
    "Grayscle": lightmap,
    "Topographic": topography,
    "Satellite" : satellitemap
  };
  
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  var myMap = L.map("map-id", {
    center: [39.8283, -98.5795],
    zoom: 3,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control options
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  // Legend
  // Most of the things i'm doing are from here: https://leafletjs.com/examples/choropleth/
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function(map) {

    var div = L.DomUtil.create('div','info legend'),
        magnitudes = [0,1,2,3,4,5],
        labels = [];

    div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>" 
    // loop through our density intervals and generate a label for each interval
    for (var i=0; i < magnitudes.length; i++){
      div.innerHTML +=
        '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
        magnitudes[i] + (magnitudes[i+1]?'&ndash;' + magnitudes[i+1] +'<br>': '+');
      }
      return div;
  };
  legend.addTo(myMap);
}