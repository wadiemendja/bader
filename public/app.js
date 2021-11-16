// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkIFaZiP2I8F6LY6LHdlMPhs6aUDyZobI",
    authDomain: "badermq-3c0a7.firebaseapp.com",
    databaseURL: "https://badermq-3c0a7-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "badermq-3c0a7",
    storageBucket: "badermq-3c0a7.appspot.com",
    messagingSenderId: "291492201083",
    appId: "1:291492201083:web:6c513331abef537d43d8de"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const ref= firebase.database().ref('/');

ref.once('value', (snap)=> {
    console.log(snap.val());
});

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

// an arbitrary start will always be the same
// only the end or destination will change
const start = [-122.662323, 45.523751];
const end = [-122.662323, 50.523751]
// this is where the code for the next step will go
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

//getRoute(start);