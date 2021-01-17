mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'hike-map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location // satellite-v9
    center: hike.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(hike.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3>${hike.title}</h3><p>${hike.location}</p>`
        )
    )
    .addTo(map)