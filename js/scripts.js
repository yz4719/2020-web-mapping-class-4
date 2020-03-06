// this is my mapboxGL token
// the base style includes data provided by mapbox, this links the requests to my account
mapboxgl.accessToken = 'pk.eyJ1IjoiY3dob25nLXFyaSIsImEiOiJjazZncWRkZGowb3kyM25vZXkwbms2cW0xIn0.lbwola6y7YDdaKLMdjif1g';

// we want to return to this point and zoom level after the user interacts
// with the map, so store them in variables
var initialCenterPoint = [-73.942780, 40.696]
var initialZoom = 10

// a helper function for looking up colors and s for NYC land use codes
var LandUseLookup = (code) => {
  switch (code) {
    case 'I':
      return {
        color: '#f4f455',
        description: 'I = Protected',
      };

    case 'II':
      return {
        color: '#ea6661',
        description: 'II = Conventional',
      };

    case 'III':
      return {
        color: '#8ece7c',
        description: 'III = Signed/ Marked Route',
      };

    case 'L':
      return {
        color: '#5f5f60',
        description: 'L = Link',
      };
    default:
      return {
        color: '#5ca2d1',
        description: 'Other',
      };
  }
};

// set the default text for the feature-info div

var defaultText = '<p>Move the mouse over the map to get more info on highest facility class found along the route</p>'
$('#feature-info').html(defaultText)

// create an object to hold the initialization options for a mapboxGL map
var initOptions = {
  container: 'map-container', // put the map in this container
  style: 'mapbox://styles/mapbox/dark-v10', // use this basemap
  center: initialCenterPoint, // initial view center
  zoom: initialZoom, // initial view zoom level (0-18)
}

// create the new map
var map = new mapboxgl.Map(initOptions);

// add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// wait for the initial style to Load
map.on('style.load', function() {

  // add a geojson source to the map using our external geojson file
  map.addSource('pluto-bk-cd6', {
    type: 'geojson',
    data: './data/bike.geojson',
  });

  // let's make sure the source got added by logging the current map state to the console
  // console.log(map.getStyle().sources)

  // add a layer for our custom source
  map.addLayer({
    id: 'fill-pluto-bk-cd6',
    type: 'line',
    source: 'pluto-bk-cd6',
    paint: {
      'line-width': 3,
      'line-color': {
        type: 'categorical',
        property: 'facilitycl',
        stops: [
          [
            'I',
            LandUseLookup('I').color,
          ],
          [
            'II',
            LandUseLookup('II').color,
          ],
          [
            'III',
            LandUseLookup('III').color,
          ],

          [
            'L',
            LandUseLookup('L').color,
          ],

        ]
      }
    }
  })

  // add an empty data source, which we will use to highlight the lot the user is hovering over
  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  // add a layer for the highlighted lot
  map.addLayer({
    id: 'highlight-line',
    type: 'line',
    source: 'highlight-feature',
    paint: {
      'line-width': 2,
      'line-opacity': 0.9,
      'line-color': 'white',
    }
  });

  // listen for the mouse moving over the map and react when the cursor is over our data

  map.on('mousemove', function (e) {
    console.log('mousemove')
    // query for the features under the mouse, but only in the lots layer
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['fill-pluto-bk-cd6'],
    });

    // if the mouse pointer is over a feature on our layer of interest
    // take the data for that feature and display it in the sidebar
    if (features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

      var hoveredFeature = features[0]
      console.log(hoveredFeature)
      var featureInfo = `

        <p><strong>CLASS </strong> ${LandUseLookup(hoveredFeature.properties.facilitycl).description}</p>
      `
      $('#feature-info').html(featureInfo)

      // set this lot's polygon feature as the data for the highlight source
      map.getSource('highlight-feature').setData(hoveredFeature.geometry);
    } else {
      // if there is no feature under the mouse, reset things:
      map.getCanvas().style.cursor = 'default'; // make the cursor default

      // reset the highlight source to an empty featurecollection
      map.getSource('highlight-feature').setData({
        type: 'FeatureCollection',
        features: []
      });

      // reset the default message
      $('#feature-info').html(defaultText)
    }
  })
  // //add legend
  // var layers = ['Class I', 'Class II', 'Class III','Class L'];
  // var colors = ['#f4f455', '#ea6661', '#8ece7c', '#5f5f60'];
  // for (i = 0; i < layers.length; i++) {
  //   var layer = layers[i];
  //   var color = colors[i];
  //   var item = document.createElement('div');
  //   var key = document.createElement('span');
  //   key.className = 'legend-key';
  //   key.style.backgroundColor = color;
  //
  //   var value = document.createElement('span');
  //   value.innerHTML = layer;
  //   item.appendChild(key);
  //   item.appendChild(value);
  //   legend.appendChild(item);
  // }
}) // closes style.load
