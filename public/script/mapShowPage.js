const hikeMap = document.getElementById('hike-map');
mapboxgl.accessToken = mapToken;
if (!mapboxgl.supported()) {
    hikeMap.classList.add('text-center');
    hikeMap.innerHTML = "You don't see the map because your browser does not support Mapbox GL. Please use another browser.";
} else { 
    hikeMap.classList.add('hike-map');

    const map = new mapboxgl.Map({
        container: 'hike-map',
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location // satellite-v9
        center: hike.geometry.coordinates, // starting position [lng, lat]
        zoom: 8 // starting zoom
    });
    
    new mapboxgl.Marker({
        color: 'orange'
    })
        .setLngLat(hike.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<h3>${hike.title}</h3><p>${hike.location}</p>`
            )
        )
        .addTo(map)
}
