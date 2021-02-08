const hikeMap = document.getElementById('location-map');

mapboxgl.accessToken = mapToken;
if (!mapboxgl.supported()) {
    const location = document.getElementById('location');
    location.readOnly = false;
    hikeMap.classList.add('text-center');
    hikeMap.innerHTML = "You don't see the map because your browser does not support Mapbox GL. Please use another browser.";
} else {
    hikeMap.classList.add('location-map');
    const center = (typeof hike === 'undefined') ? [-122.3321, 47.6062] : hike.geometry.coordinates;

    const map = new mapboxgl.Map({
        container: 'location-map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center,
        zoom: 8
    });

    if (typeof hike !== 'undefined') {
        const marker = new mapboxgl.Marker({
            color: 'orange'
        })
            .setLngLat(hike.geometry.coordinates)
            .addTo(map)
    
        map.on('load', function () {
            geocoder.on('result', function (ev) {
                marker.remove();
            });
        })
    }
         
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        marker: {
            color: 'orange'
        },
        mapboxgl: mapboxgl
    });
    
    map.addControl(geocoder);



    const locationSearchInput = document.querySelector('.mapboxgl-ctrl-geocoder--input');
    const locationInput = document.getElementById('location');
    locationSearchInput.addEventListener('change', function (e) {
        locationInput.value = locationSearchInput.value;
    })

}


