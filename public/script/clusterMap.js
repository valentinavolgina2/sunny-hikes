mapboxgl.accessToken = mapToken;
var map = new mapboxgl.Map({
    container: 'cluster-map',
    style: 'mapbox://styles/mapbox/streets-v11', //light-v10
    center: [long, lat], //centered on Seattle
    zoom: getZoom()
});

function getZoom() {
    if (distance < 50) {
        return 10;
    } else if (distance < 100) {
        return 8;
    } else if (distance < 200) {
        return 7;
    } else { 
        return 6;
    }
}

map.addControl(new mapboxgl.NavigationControl());
 
map.on('load', function () {
// Add a new source from our GeoJSON data and
// set the 'cluster' option to true. GL-JS will
// add the point_count property to your source data.
    map.addSource('hikes', {
        type: 'geojson',
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: hikes,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });
    
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'hikes',
        filter: ['has', 'point_count'],
        paint: {
    // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
    // with three steps to implement three types of circles:
    //   * Blue, 20px circles when point count is less than 100
    //   * Yellow, 30px circles when point count is between 100 and 750
    //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
            'step',
            ['get', 'point_count'],
            'red',
            10,
            'red',
            30,
            'red'
            ],
            'circle-radius': [
            'step',
            ['get', 'point_count'],
            15,
            10,
            25,
            30,
            30
            ]
        }
    });
    
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'hikes',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });
    
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'hikes',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': 'red',
            'circle-radius': 10,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });
    
    // inspect a cluster on click
    map.on('click', 'clusters', function (e) {
        const features = map.queryRenderedFeatures(e.point, {layers: ['clusters']});
        const clusterId = features[0].properties.cluster_id;
        map.getSource('hikes').getClusterExpansionZoom(
            clusterId,
            function (err, zoom) {
                if (err) return;
                
                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });
    
    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', function (e) {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const text = e.features[0].properties.popUpMarkup;
    
    // Ensure that if the map is zoomed out such that
    // multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
    
        new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(text)
        .addTo(map);
    });
    
    map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = '';
    });
});