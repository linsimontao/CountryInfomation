import React, {useRef, useEffect, useState} from 'react'
import mapboxgl from 'mapbox-gl'
import Legend from './components/Legend'
// import Optionsfield from './components/Optionsfield'
import './Map.css'
// import {setActiveOption} from './redux/action-creators'
import {connect} from 'react-redux'


function mapStateToPropsLegend(state) {
    return {
        active: state.active
    }
}

const ConnectedLegend = connect(mapStateToPropsLegend)(Legend)

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESSTOKEN

const Map = props => {
    const mapContainerRef = useRef(null)
    const [map, setMap] = useState(null)

    useEffect(
        () => {
            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [5, 34],
                zoom: 1.5
            })

            map.on(
                'load',
                () => {
                    map.addSource(
                        'countries',
                        {
                            type: 'geojson',
                            data: props.data
                        }
                    )

                    map.setLayoutProperty(
                        'country-label',
                        'text-field',
                        [
                            'format', 
                            ['get', 'name_en'],
                            {'font-size': 1.2},
                            '\n',
                            {},
                            ['get', 'name'],
                            {
                                'font-scale': 0.8,
                                'text-font': [
                                    'literal',
                                    ['DIN Offc Pro Italic', 'Arial Unicode MS Regular']
                                ]
                            }
                        ]
                    )

                    map.addLayer(
                        {
                            id: 'countries',
                            type: 'fill',
                            source: 'countries'
                        },
                        'country-label'
                    )

                    map.setPaintProperty(
                        'countries',
                        'fill-color',
                        {
                            property: props.active.property,
                            stops: props.active.stops
                        },
                    )

                    map.on('click', 'countries', function (e) {
                        new mapboxgl.Popup()
                            .setLngLat(e.lngLat)
                            .setHTML(
                                `<h1>${e.features[0].properties.name}</h1>
                                 <h5>${e.features[0].properties.pop_est.toLocaleString()}</h5>
                                `
                            )
                            .addTo(map);
                    });
                         
                    // Change the cursor to a pointer when the mouse is over the states layer.
                    map.on('mouseenter', 'states-layer', function () {
                        map.getCanvas().style.cursor = 'pointer';
                    });
                        
                    // Change it back to a pointer when it leaves.
                    map.on('mouseleave', 'states-layer', function () {
                        map.getCanvas().style.cursor = '';
                    });

                    setMap(map)
                }
            )

            return () => map.remove()
        },
        []
    )

    useEffect(
        () => {
            paint();
        }, 
        [props.active]
    )
    
    const paint = () => {    
        if (map) {
            map.setPaintProperty(
                'countries',
                'fill-color',
                {
                    property: props.active.property,
                    stops: props.active.stops
                }
            )
        }
    }

    return (
        <div>
            <div ref={mapContainerRef} className='map-container' />
            <ConnectedLegend />
        </div>
    )
}

export default Map;