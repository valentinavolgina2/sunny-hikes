mapboxgl.accessToken = mapToken;
var map = new mapboxgl.Map({
    container: 'cluster-map',
    style: 'mapbox://styles/mapbox/dark-v9', //streets-v11', //light-v10
    center: [long, lat], //centered on Seattle
    zoom: getZoom()
});

// const weatherFilters = document.querySelectorAll('.weather-filter');
// weatherFilters.forEach(weatherFilter => { 
//     weatherFilter.addEventListener('change', (event) => { 
//         const value = weatherFilter.value;
//         if (weatherFilter.checked) {
//             weatherCatagories.push([value, 'blue']);
//         } else { 
//             weatherCatagories = weatherCatagories.filter(wc => wc[0] !== value);
//         }
//         console.log(weatherCatagories);
//     })
// });

const weatherCatagories = [
    ['None', '#35504F'],
    ['Thunderstorm', '#BC3842'],
    ['Rain','#216C84'],
	['Drizzle','#91C1C1'],
    ['Snow','#F5F8F5'],
    ['Clouds','#DEB4A9'],
    ['Clear','#DBC85E'],
    ['Mist','#7EBDAB'],
    ['Smoke','#817553'],
    ['Haze','#7EBDAB'],
    ['Dust','#817553'],
    ['Fog','#7EBDAB'],
    ['Sand','#817553'],
    ['Ash','#817553'],
    ['Squall','#BC3842'],
    ['Tornado','#BC3842']
];


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
        clusterMaxZoom: 0, // Max zoom to cluster points on
        clusterRadius: 0 // Radius of each cluster when clustering points (defaults to 50)
    });

    
    
    // map.addLayer({
    //     id: 'clusters',
    //     type: 'circle',
    //     source: 'hikes',
    //     filter: ['has', 'point_count'],
    //     paint: {
    //         'circle-color': [
    //         'step',
    //         ['get', 'point_count'],
    //         'red',
    //         30,
    //         'yellow',
    //         50,
    //         'blue'
    //         ],
    //         'circle-radius': [
    //         'step',
    //         ['get', 'point_count'],
    //         15,
    //         30,
    //         25,
    //         50,
    //         30
    //         ]
    //     }
    // });
    
    // map.addLayer({
    //     id: 'cluster-count',
    //     type: 'symbol',
    //     source: 'hikes',
    //     filter: ['has', 'point_count'],
    //     layout: {
    //         'text-field': '{point_count_abbreviated}',
    //         'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    //         'text-size': 12
    //     }
    // });
    
    
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'hikes',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-radius': 10,
//            'circle-opacity': 0.9,
            'circle-color': {
                property: 'weatherIcon',
                type: 'categorical',
                stops: weatherCatagories
            }
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