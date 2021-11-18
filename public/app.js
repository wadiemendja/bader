// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBFy40fjEMRLcsuqMp4ko-mFF47cKmwheA",
    authDomain: "badermapbox.firebaseapp.com",
    databaseURL: "https://badermapbox-default-rtdb.firebaseio.com",
    projectId: "badermapbox",
    storageBucket: "badermapbox.appspot.com",
    messagingSenderId: "752048233454",
    appId: "1:752048233454:web:48037a00c2a993d2f84cff"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const ref = firebase.database().ref('/task1/');
// an arbitrary start will always be the same
// only the end or destination will change
// ref.update({ x: -122.662323, y: 45.523751 });
let startX, startY, destX, destY;
await ref.once('value', (snap) => {
    const data = snap.val();
    console.log(data);
    console.log(data.start.x)
    startX = data.start.x;
    startY = data.start.y;
    destX = data.destination.x;
    destY = data.destination.y;
});
const start = [startX, startY];
// destination point
const end = [destX, destY];

mapboxgl.accessToken = 'pk.eyJ1Ijoid2FkaWVtZW5kamEiLCJhIjoiY2t3MXd2cXU1MGZrdTMxbW96YzBqbjNvayJ9.3uSDABakcWuPDeiBh12pIQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-122.662323, 45.523751], // starting position
    zoom: 12
});
// set the bounds of the map
const bounds = [
    [-123.069003, 45.395273],
    [-122.303707, 45.612333]
];
map.setMaxBounds(bounds);

// -----------------------------------------------------------------
// create a function to make a directions request
async function getRoute(end) {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change
    const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: route
        }
    };
    // if the route already exists on the map, we'll reset it using setData
    if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
    }
    // otherwise, we'll make a new request
    else {
        map.addLayer({
            id: 'route',
            type: 'line',
            source: {
                type: 'geojson',
                data: geojson
            },
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75
            }
        });
    }
    // add turn instructions here at the end
}
// ------------------------------------------------------------------------
map.on('load', () => {
    // make an initial directions request that
    // starts and ends at the same location
    getRoute(start);

    // Add starting point to the map
    map.addLayer({
        id: 'point',
        type: 'circle',
        source: {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Point',
                            coordinates: start
                        }
                    }
                ]
            }
        },
        paint: {
            'circle-radius': 10,
            'circle-color': '#3887be'
        }
    });
    // this is where the code from the next step will go
    map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    [-122.483696, 37.833818],
                    [-122.483482, 37.833174],
                    [-122.483396, 37.8327],
                    [-122.483568, 37.832056],
                    [-122.48404, 37.831141],
                    [-122.48404, 37.830497],
                    [-122.483482, 37.82992],
                    [-122.483568, 37.829548],
                    [-122.48507, 37.829446],
                    [-122.4861, 37.828802],
                    [-122.486958, 37.82931],
                    [-122.487001, 37.830802],
                    [-122.487516, 37.831683],
                    [-122.488031, 37.832158],
                    [-122.488889, 37.832971],
                    [-122.489876, 37.832632],
                    [-122.490434, 37.832937],
                    [-122.49125, 37.832429],
                    [-122.491636, 37.832564],
                    [-122.492237, 37.833378],
                    [-122.493782, 37.833683]
                ]
            }
        }
    });
});
// ------------------------------------------------------
// add destenation by clicking on the map
map.on('click', (event) => {
    const coords = Object.keys(event.lngLat).map((key) => event.lngLat[key]);
    const end = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Point',
                    coordinates: coords
                }
            }
        ]
    };
    if (map.getLayer('end')) {
        map.getSource('end').setData(end);
    } else {
        map.addLayer({
            id: 'end',
            type: 'circle',
            source: {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: coords
                            }
                        }
                    ]
                }
            },
            paint: {
                'circle-radius': 10,
                'circle-color': '#f30'
            }
        });
    }
    getRoute(coords);
});
// -----------------------------------------------------------
// get the sidebar and add the instructions
// const instructions = document.getElementById('instructions');
// const steps = data.legs[0].steps;

// let tripInstructions = '';
// for (const step of steps) {
//   tripInstructions += `<li>${step.maneuver.instruction}</li>`;
// }
// instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
//   data.duration / 60
// )} min 🚴 </strong></p><ol>${tripInstructions}</ol>`;
// -----------------------------------------------------------
/// setInterval(() => {
    // getRoute(end);
// }, 1000);
