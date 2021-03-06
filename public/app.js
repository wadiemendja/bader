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

const ref = firebase.database().ref('/task/');
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
});
const start = [startX, startY];

mapboxgl.accessToken = 'pk.eyJ1Ijoid2FkaWVtZW5kamEiLCJhIjoiY2t3MXd2cXU1MGZrdTMxbW96YzBqbjNvayJ9.3uSDABakcWuPDeiBh12pIQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-122.662323, 45.523751], // starting position
    zoom: 12
});
// set the bounds of the map
// const bounds = [
//     [-123.069003, 45.395273],
//     [-122.303707, 45.612333]
// ];
// map.setMaxBounds(bounds);

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
    // moving to destination
    let firstLoop = true;
    setInterval(() => {
        if (firstLoop) {
            map.removeLayer("point");
            firstLoop = false;
        }
        if (start[0] > coords[0]) start[0] -= .001; else if (start[0] < coords[0]) start[0] += .001;
        if (start[1] > coords[1]) start[1] -= .001; else if (start[1] < coords[1]) start[1] += .001;
        getRoute(start);
        const layerID = 'layer' + Math.floor(Math.random() * 1000);
        map.addLayer({
            id: layerID,
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
        setTimeout(() => {
            map.removeLayer(layerID);
        }, 1000);
    }, 1000);
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
// )} min ???? </strong></p><ol>${tripInstructions}</ol>`;
// -----------------------------------------------------------
/// setInterval(() => {
    // getRoute(end);
// }, 1000);
